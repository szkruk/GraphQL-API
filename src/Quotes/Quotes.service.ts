import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common';
import { TickerEntity } from '../Tickers/entities/Ticker.entity';
import { TickersService } from '../Tickers/Tickers.service';
import { Repository } from 'typeorm/repository/Repository';
import { CreateQuoteInput } from './dto/Create-Quote.input';
import { QuoteEntity } from './entities/Quote.entity';
import { QuoteModel } from './model/Quote.model';
import { DatabaseException } from '../common/database.exception';
import { TickerModel } from '../Tickers/model/Ticker.model';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(QuoteEntity)
    private quotesRepository: Repository<QuoteEntity>,
    private tickersService: TickersService,
  ) {}

  async findAll(): Promise<QuoteModel[]> {
    try {
      return await this.quotesRepository.find();
    } catch {
      throw new DatabaseException();
    }
  }

  async findOne(name: string, timestamp: number): Promise<QuoteModel> {
    try {
      const Quote: QuoteModel = await this.quotesRepository.manager.findOne(
        QuoteEntity,
        {
          where: {
            name: name,
            timestamp: timestamp,
          },
        },
      );

      if (Quote == null) {
        throw new BadRequestException('Value not founded', {
          description: 'There is not qoute with this name and timestamp.',
        });
      }

      return Quote;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }

  async findAllByTimestamp(timestamp: number): Promise<QuoteModel[]> {
    try {
      const quotes: QuoteModel[] = await this.quotesRepository.manager.findBy(
        QuoteEntity,
        {
          timestamp: timestamp,
        },
      );
      if (quotes.length == 0) {
        throw new BadRequestException('No records for this timestamp', {
          description: 'There are not any qoutes with this timestamp.',
        });
      }
      return quotes;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }

  async findAllByName(name: string): Promise<QuoteModel[]> {
    try {
      const ticker: TickerModel = await this.quotesRepository.manager.findOne(
        TickerEntity,
        {
          where: {
            name: name,
          },
        },
      );
      let qoutes: QuoteModel[];
      if (ticker == null) {
        throw new BadRequestException('There is no ticker with this name', {
          description: 'There is no ticker with this name. Check your name.',
        });
      } else {
        qoutes = await this.quotesRepository.manager.findBy(QuoteEntity, {
          name: name,
        });
      }

      return qoutes;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }

  async createQuote(createQuoteInput: CreateQuoteInput): Promise<QuoteModel> {
    const queryRunner =
      this.quotesRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.startTransaction('SERIALIZABLE');

      if (
        (await queryRunner.manager.findOne(QuoteEntity, {
          where: {
            name: createQuoteInput.name,
            timestamp: createQuoteInput.timestamp,
          },
        })) != null
      ) {
        throw new BadRequestException('Qoute already exists', {
          description: 'There is a quote with same name and timestamp.',
        });
      }
      if (
        (await queryRunner.manager.findOne(TickerEntity, {
          where: {
            name: createQuoteInput.name,
          },
        })) == null
      ) {
        await this.tickersService.create({
          name: createQuoteInput.name,
          fullName: 'unknown',
        });
      }

      const newQuote = this.quotesRepository.create(createQuoteInput);

      await this.quotesRepository.save(newQuote);

      await queryRunner.commitTransaction();

      await queryRunner.release();

      return newQuote;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }

  async update(createQuoteInput: CreateQuoteInput): Promise<QuoteModel> {
    const queryRunner =
      this.quotesRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.startTransaction('SERIALIZABLE');

      const Quote = await this.quotesRepository.findOne({
        where: {
          name: createQuoteInput.name,
          timestamp: createQuoteInput.timestamp,
        },
      });

      if (Quote != null) {
        await this.quotesRepository.update(
          {
            name: createQuoteInput.name,
            timestamp: createQuoteInput.timestamp,
          },
          { price: createQuoteInput.price },
        );
      } else {
        throw new BadRequestException("Quote doesn't exists", {
          description: "Quote with this name and timestamp doesn't exists.",
        });
      }
      Quote.price = createQuoteInput.price;

      await queryRunner.commitTransaction();

      await queryRunner.release();

      return Quote;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }

  async deleteQuote(name: string, timestamp: number): Promise<QuoteModel> {
    const queryRunner =
      this.quotesRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.startTransaction('SERIALIZABLE');

      const Quote = await queryRunner.manager.findOne(QuoteEntity, {
        where: {
          name: name,
          timestamp: timestamp,
        },
      });

      if (Quote == null) {
        throw new BadRequestException("Quote doesn't exists", {
          description: "You can't delete quote which doesn't exist",
        });
      } else {
        await this.quotesRepository.delete(Quote);
      }

      await queryRunner.commitTransaction();

      await queryRunner.release();

      return Quote;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }
}
