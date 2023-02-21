import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common';
import { TickerEntity } from 'src/tickers/entities/ticker.entity';
import { TickerModel } from 'src/tickers/model/ticker.model';
import { TickersService } from 'src/tickers/tickers.service';
import { Repository } from 'typeorm/repository/Repository';
import { CreateQuoteInput } from './dto/create-quote.input';
import { QuoteEntity } from './entities/quote.entity';
import { QuoteModel } from './model/quote.model';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(QuoteEntity)
    private quotesRepository: Repository<QuoteEntity>,
    private tickersService: TickersService,
  ) {}

  async findAll(): Promise<QuoteModel[]> {
    try {
      const Quotes = await this.quotesRepository.find();
      return Quotes;
    } catch (error) {
      throw new NotImplementedException('Coś nie tak', {
        cause: new Error(),
        description: 'Jakis blad',
      });
    }
  }

  async findOne(name: string, timestamp: number): Promise<QuoteModel> {
    try {
      const Quote: QuoteModel = await this.quotesRepository.findOneByOrFail({
        name: name,
        timestamp: timestamp,
      });
      return Quote;
    } catch (error) {
      throw new NotImplementedException('Value not founded', {
        cause: new Error(),
        description: 'There is not qoute with this name and timestamp',
      });
    }
  }

  async findAllByTimeStamp(timestamp: number): Promise<QuoteModel[]> {
    try {
      const quotes: QuoteModel[] = await this.quotesRepository.findBy({
        timestamp: timestamp,
      });
      return quotes;
    } catch (error) {
      throw new NotImplementedException('Value not founded', {
        cause: new Error(),
        description: 'There are not any qoutes with this timestamp',
      });
    }
  }

  async findAllByName(name: string): Promise<QuoteModel[]> {
    try {
      const quotes: QuoteModel[] = await this.quotesRepository.findBy({
        name: name,
      });
      return quotes;
    } catch (error) {
      throw new NotImplementedException('Value not founded', {
        cause: new Error(),
        description: 'There are not any qoutes with this name ',
      });
    }
  }

  async findTicker(name: string): Promise<TickerModel> {
    try {
      return this.tickersService.findOne(name);
    } catch (error) {
      throw new NotImplementedException('Value not founded', {
        cause: new Error(),
        description: 'There are not any qoutes with this name ',
      });
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
        })) !== null
      ) {
        throw new BadRequestException('Qoute already exists', {
          cause: new Error(),
          description: 'There was error ',
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

      throw error;
      // throw new NotImplementedException('Value not founded', {
      //   cause: new Error(),
      //   description: 'There was error ',
      // });
    }
  }

  async editQuote(createQuoteInput: CreateQuoteInput): Promise<QuoteModel> {
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

      if (Quote !== null) {
        await this.quotesRepository.update(
          {
            name: createQuoteInput.name,
            timestamp: createQuoteInput.timestamp,
          },
          { price: createQuoteInput.price },
        );
      } else {
        throw new NotImplementedException('There is no quote like this', {
          cause: new Error(),
          description: 'There is no Qoute like this ',
        });
      }
      Quote.price = createQuoteInput.price;

      await queryRunner.commitTransaction();

      await queryRunner.release();

      return Quote;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw error;
    }
  }

  async deleteQuote(name: string, timestamp: number): Promise<QuoteModel> {
    const queryRunner =
      this.quotesRepository.manager.connection.createQueryRunner();

    try {
      queryRunner.startTransaction('SERIALIZABLE');

      const Quote = await queryRunner.manager.findOne(QuoteEntity, {
        where: {
          name: name,
          timestamp: timestamp,
        },
      });

      if (Quote == null) {
        throw new NotImplementedException('Nothing to delete', {
          cause: new Error(),
          description: 'There is no Qoute like this ',
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

      throw error;
    }
  }
}
