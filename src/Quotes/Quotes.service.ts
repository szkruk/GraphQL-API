import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common';
import { TickerEntity } from '../Tickers/entities/Ticker.entity';
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
  ) {}

  async findAll(): Promise<QuoteModel[]> {
    const queryRunner =
      this.quotesRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();

    try {
      const Quotes = await queryRunner.manager.find(QuoteEntity);

      await queryRunner.release();

      return Quotes;
    } catch {
      await queryRunner.release();

      throw new DatabaseException();
    }
  }

  async findOne(name: string, timestamp: number): Promise<QuoteModel> {
    const queryRunner =
      this.quotesRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();

    try {
      const Quote: QuoteModel = await queryRunner.manager.findOne(QuoteEntity, {
        where: {
          name: name,
          timestamp: timestamp,
        },
      });

      if (Quote == null) {
        throw new BadRequestException('Value not founded', {
          description: 'There is not qoute with this name and timestamp.',
        });
      }
      await queryRunner.release();

      return Quote;
    } catch (error) {
      await queryRunner.release();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }

  async findAllByTimestamp(timestamp: number): Promise<QuoteModel[]> {
    const queryRunner =
      this.quotesRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();

    try {
      const quotes: QuoteModel[] = await queryRunner.manager.findBy(
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

      await queryRunner.release();

      return quotes;
    } catch (error) {
      await queryRunner.release();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }

  async findAllByName(name: string): Promise<QuoteModel[]> {
    const queryRunner =
      this.quotesRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();

    try {
      const ticker: TickerModel = await queryRunner.manager.findOne(
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
        qoutes = await queryRunner.manager.findBy(QuoteEntity, {
          name: name,
        });
      }
      await queryRunner.release();

      return qoutes;
    } catch (error) {
      await queryRunner.release();

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

    await queryRunner.connect();

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
        await queryRunner.manager.insert(TickerEntity, {
          name: createQuoteInput.name,
          fullName: 'unknown',
        });
      }

      await queryRunner.manager.insert(QuoteEntity, {
        ...createQuoteInput,
      });

      await queryRunner.commitTransaction();

      await queryRunner.release();

      return createQuoteInput;
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

    await queryRunner.connect();

    try {
      await queryRunner.startTransaction('SERIALIZABLE');

      const Quote = await queryRunner.manager.findOne(QuoteEntity, {
        where: {
          name: createQuoteInput.name,
          timestamp: createQuoteInput.timestamp,
        },
      });

      if (Quote != null) {
        await queryRunner.manager.update(
          QuoteEntity,
          {
            name: createQuoteInput.name,
            timestamp: createQuoteInput.timestamp,
          },
          { ...createQuoteInput },
        );
      } else {
        throw new BadRequestException("Quote doesn't exists", {
          description: "Quote with this name and timestamp doesn't exists.",
        });
      }

      await queryRunner.commitTransaction();

      await queryRunner.release();

      return createQuoteInput;
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

    await queryRunner.connect();

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
        await queryRunner.manager.delete(QuoteEntity, { ...Quote });
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
