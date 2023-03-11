/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseException } from '../common/Database.exception';
import { DataSourceManager } from '../common/DataSourceManager';
import { CreateTickerInput } from './dto/Create-Ticker.input';
import { TickerEntity } from './entities/Ticker.entity';
import { TickerModel } from './model/Ticker.model';

@Injectable()
export class TickersService {
  private dataSourceManager: DataSourceManager;

  constructor(private readonly dataSource: DataSource) {
    this.dataSourceManager = new DataSourceManager(dataSource);
  }
  private readonly maxAttempts = 5;
  private readonly delayMs = 1000;

  async findAll(): Promise<TickerModel[]> {
    await this.dataSourceManager.startConnection();
    try {
      const Tickers = await this.dataSourceManager
        .getManager()
        .find(TickerEntity);

      await this.dataSourceManager.releaseConnection();

      return Tickers;
    } catch {
      await this.dataSourceManager.releaseConnection();

      throw new DatabaseException();
    }
  }

  async create(createTickerInput: CreateTickerInput): Promise<TickerModel> {
    await this.dataSourceManager.startConnection();

    let attempt = 0;

    while (true) {
      try {
        await this.dataSourceManager.startTransaction();

        if (
          (await this.dataSourceManager.getManager().findOne(TickerEntity, {
            where: {
              name: createTickerInput.name,
            },
          })) != null
        ) {
          throw new BadRequestException('Ticker already exists', {
            description:
              'You are trying to create ticker, which already exists.',
          });
        }

        await this.dataSourceManager.getManager().insert(TickerEntity, {
          ...createTickerInput,
        });

        await this.dataSourceManager.commitTransaction();

        // If transactian was succesfull loop is broken
        break;
      } catch (error) {
        await this.dataSourceManager.checkForThrowingError(error, attempt);

        await this.dataSourceManager.rollbackAndWait(attempt);
      }
    }
    return createTickerInput;
  }

  async findOne(name: string): Promise<TickerModel> {
    await this.dataSourceManager.startConnection();

    try {
      const Ticker = await this.dataSourceManager
        .getManager()
        .findOne(TickerEntity, {
          where: {
            name: name,
          },
        });
      if (Ticker == null) {
        throw new BadRequestException('Ticker not found', {
          description: 'Ticker with this name doesnt exist',
        });
      }

      await this.dataSourceManager.releaseConnection();

      return Ticker;
    } catch (error) {
      await this.dataSourceManager.throwDatabaseorBadRequestException(error);
    }
  }

  async deleteTicker(name: string): Promise<TickerModel> {
    await this.dataSourceManager.startConnection();
    let Ticker;
    let attempt = 0;

    while (true) {
      try {
        await this.dataSourceManager.startTransaction();

        Ticker = await this.dataSourceManager
          .getManager()
          .findOne(TickerEntity, {
            where: {
              name: name,
            },
          });

        if (Ticker == null) {
          throw new BadRequestException('Value not founded', {
            description: 'There is not ticker with this name.',
          });
        } else {
          await this.dataSourceManager
            .getManager()
            .delete(TickerEntity, { ...Ticker });
        }

        await this.dataSourceManager.commitTransaction();

        // If transactian was succesfull loop is broken
        break;
      } catch (error) {
        await this.dataSourceManager.checkForThrowingError(error, attempt);

        await this.dataSourceManager.rollbackAndWait(attempt);
      }
    }

    return Ticker;
  }

  async updateTicker(
    createTickerInput: CreateTickerInput,
  ): Promise<TickerModel> {
    await this.dataSourceManager.startConnection();

    let attempt = 0;

    while (true) {
      try {
        await this.dataSourceManager.startTransaction();

        const Ticker = await this.dataSourceManager
          .getManager()
          .findOne(TickerEntity, {
            where: {
              name: createTickerInput.name,
            },
          });

        if (Ticker != null) {
          await this.dataSourceManager.getManager().update(
            TickerEntity,
            {
              name: createTickerInput.name,
            },
            { ...createTickerInput },
          );
        } else {
          throw new BadRequestException('There is no ticker like this', {
            description: 'There is no ticker like this.',
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

    return createTickerInput;
  }
}
