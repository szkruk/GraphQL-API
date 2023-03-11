/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { TickerEntity } from '../Tickers/entities/Ticker.entity';
import { CreateQuoteInput } from './dto/Create-Quote.input';
import { QuoteEntity } from './entities/Quote.entity';
import { QuoteModel } from './model/Quote.model';
import { DatabaseException } from '../common/Database.exception';
import { TickerModel } from '../Tickers/model/Ticker.model';
import { DataSourceManager } from '../common/DataSourceManager';
import { DataSource } from 'typeorm';

@Injectable()
export class QuotesService {
  private dataSourceManager: DataSourceManager;

  constructor(private readonly dataSource: DataSource) {
    this.dataSourceManager = new DataSourceManager(dataSource);
  }
  private readonly maxAttempts = 5;
  private readonly delayMs = 1000;

  async findAll(): Promise<QuoteModel[]> {
    await this.dataSourceManager.startConnection();

    try {
      const Quotes = await this.dataSourceManager
        .getManager()
        .find(QuoteEntity);

      await this.dataSourceManager.releaseConnection();

      return Quotes;
    } catch {
      await this.dataSourceManager.releaseConnection();

      throw new DatabaseException();
    }
  }

  async findOne(name: string, timestamp: number): Promise<QuoteModel> {
    await this.dataSourceManager.startConnection();

    try {
      const Quote: QuoteModel = await this.dataSourceManager
        .getManager()
        .findOne(QuoteEntity, {
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

      await this.dataSourceManager.releaseConnection();

      return Quote;
    } catch (error) {
      await this.dataSourceManager.throwDatabaseorBadRequestException(error);
    }
  }

  async findAllByTimestamp(timestamp: number): Promise<QuoteModel[]> {
    await this.dataSourceManager.startConnection();

    try {
      const quotes: QuoteModel[] = await this.dataSourceManager
        .getManager()
        .findBy(QuoteEntity, {
          timestamp: timestamp,
        });
      if (quotes.length == 0) {
        throw new BadRequestException('No records for this timestamp', {
          description: 'There are not any qoutes with this timestamp.',
        });
      }

      await this.dataSourceManager.releaseConnection();

      return quotes;
    } catch (error) {
      await this.dataSourceManager.throwDatabaseorBadRequestException(error);
    }
  }

  async findAllByName(name: string): Promise<QuoteModel[]> {
    await this.dataSourceManager.startConnection();

    try {
      const ticker: TickerModel = await this.dataSourceManager
        .getManager()
        .findOne(TickerEntity, {
          where: {
            name: name,
          },
        });
      let qoutes: QuoteModel[];

      if (ticker == null) {
        throw new BadRequestException('There is no ticker with this name', {
          description: 'There is no ticker with this name. Check your name.',
        });
      } else {
        qoutes = await this.dataSourceManager.getManager().findBy(QuoteEntity, {
          name: name,
        });
      }
      await this.dataSourceManager.releaseConnection();

      return qoutes;
    } catch (error) {
      await this.dataSourceManager.throwDatabaseorBadRequestException(error);
    }
  }

  async createQuote(createQuoteInput: CreateQuoteInput): Promise<QuoteModel> {
    await this.dataSourceManager.startConnection();

    let attempt = 0;

    while (true) {
      try {
        await this.dataSourceManager.startTransaction();

        if (
          (await this.dataSourceManager.getManager().findOne(QuoteEntity, {
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
          (await this.dataSourceManager.getManager().findOne(TickerEntity, {
            where: {
              name: createQuoteInput.name,
            },
          })) == null
        ) {
          await this.dataSourceManager.getManager().insert(TickerEntity, {
            name: createQuoteInput.name,
            fullName: 'unknown',
          });
        }

        await this.dataSourceManager.getManager().insert(QuoteEntity, {
          ...createQuoteInput,
        });

        await this.dataSourceManager.commitTransaction();
        // If transactian was succesfull loop is broken
        break;
      } catch (error) {
        await this.dataSourceManager.checkForThrowingError(error, attempt);

        await this.dataSourceManager.rollbackAndWait(attempt);
      }
    }

    return createQuoteInput;
  }

  async update(createQuoteInput: CreateQuoteInput): Promise<QuoteModel> {
    await this.dataSourceManager.startConnection();

    let attempt = 0;

    while (true) {
      try {
        await this.dataSourceManager.startTransaction();
        const Quote = await this.dataSourceManager
          .getManager()
          .findOne(QuoteEntity, {
            where: {
              name: createQuoteInput.name,
              timestamp: createQuoteInput.timestamp,
            },
          });

        if (Quote != null) {
          await this.dataSourceManager.getManager().update(
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

        await this.dataSourceManager.commitTransaction();
        // If transactian was succesfull loop is broken
        break;
      } catch (error) {
        await this.dataSourceManager.checkForThrowingError(error, attempt);

        await this.dataSourceManager.rollbackAndWait(attempt);
      }
    }
    return createQuoteInput;
  }

  async deleteQuote(name: string, timestamp: number): Promise<QuoteModel> {
    await this.dataSourceManager.startConnection();
    let Quote;
    let attempt = 0;

    while (true) {
      try {
        await this.dataSourceManager.startTransaction();

        Quote = await this.dataSourceManager.getManager().findOne(QuoteEntity, {
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
          await this.dataSourceManager
            .getManager()
            .delete(QuoteEntity, { ...Quote });
        }

        await this.dataSourceManager.commitTransaction();

        // If transactian was succesfull loop is broken
        break;
      } catch (error) {
        await this.dataSourceManager.checkForThrowingError(error, attempt);

        await this.dataSourceManager.rollbackAndWait(attempt);
      }
    }
    return Quote;
  }
}
