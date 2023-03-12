/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { TickerEntity } from '../Tickers/entities/Ticker.entity';
import { CreateQuoteInput } from './dto/Create-Quote.input';
import { QuoteEntity } from './entities/Quote.entity';
import { QuoteModel } from './model/Quote.model';
import { DatabaseException } from '../common/Database.exception';
import { TickerModel } from '../Tickers/model/Ticker.model';
import { DataSource } from 'typeorm';
import { RequestLimitException } from '../common/Request-Limit.exception';

@Injectable()
export class QuotesService {
  constructor(private readonly dataSource: DataSource) {}
  private readonly maxAttempts = 5;
  private readonly delayMs = 1000;

  async findAll(): Promise<QuoteModel[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const Quotes = await queryRunner.manager.find(QuoteEntity);

      await queryRunner.manager.release();

      return Quotes;
    } catch {
      await queryRunner.manager.release();

      throw new DatabaseException();
    }
  }

  async findOne(name: string, timestamp: number): Promise<QuoteModel> {
    const queryRunner = this.dataSource.createQueryRunner();
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

      await queryRunner.manager.release();

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
    const queryRunner = this.dataSource.createQueryRunner();
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

      await queryRunner.manager.release();

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
    const queryRunner = this.dataSource.createQueryRunner();
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    let attempt = 0;

    while (true) {
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
        // If transaction was succesfull loop is broken
        break;
      } catch (error) {
        if (error instanceof BadRequestException) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw error;
        }

        if (error.code != '40001' && error.code != '23505') {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw new DatabaseException();
        }

        if (attempt > this.maxAttempts) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw new RequestLimitException();
        }

        await queryRunner.rollbackTransaction();
        attempt += 1;

        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
    }

    return createQuoteInput;
  }

  async update(createQuoteInput: CreateQuoteInput): Promise<QuoteModel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    let attempt = 0;

    while (true) {
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
        // If transactian was succesfull loop is broken
        break;
      } catch (error) {
        if (error instanceof BadRequestException) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw error;
        }

        if (error.code != '40001' && error.code != '23505') {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw new DatabaseException();
        }

        if (attempt > this.maxAttempts) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw new RequestLimitException();
        }

        await queryRunner.rollbackTransaction();
        attempt += 1;

        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
    }
    return createQuoteInput;
  }

  async deleteQuote(name: string, timestamp: number): Promise<QuoteModel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    let attempt = 0;
    let Quote;

    while (true) {
      try {
        await queryRunner.startTransaction('SERIALIZABLE');

        Quote = await queryRunner.manager.findOne(QuoteEntity, {
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

        // If transactian was succesfull loop is broken
        break;
      } catch (error) {
        if (error instanceof BadRequestException) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw error;
        }

        if (error.code != '40001' && error.code != '23505') {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw new DatabaseException();
        }

        if (attempt > this.maxAttempts) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw new RequestLimitException();
        }

        await queryRunner.rollbackTransaction();
        attempt += 1;

        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
    }
    return Quote;
  }
}
