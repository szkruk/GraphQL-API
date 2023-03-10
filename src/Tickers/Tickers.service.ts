import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseException } from '../common/database.exception';
import { DataSourceManager } from '../common/transaction';
import { CreateTickerInput } from './dto/Create-Ticker.input';
import { TickerEntity } from './entities/Ticker.entity';
import { TickerModel } from './model/Ticker.model';

@Injectable()
export class TickersService {
  private dataSourceManager: DataSourceManager;

  constructor(private readonly dataSource: DataSource) {
    this.dataSourceManager = new DataSourceManager(dataSource);
  }

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
    await this.dataSourceManager.startTransaction();

    try {
      if (
        (await this.dataSourceManager.getManager().findOne(TickerEntity, {
          where: {
            name: createTickerInput.name,
          },
        })) != null
      ) {
        throw new BadRequestException('Ticker already exists', {
          description: 'You are trying to create ticker, which already exists.',
        });
      }

      await this.dataSourceManager.getManager().insert(TickerEntity, {
        ...createTickerInput,
      });

      await this.dataSourceManager.commitTransaction();

      return createTickerInput;
    } catch (error) {
      await this.dataSourceManager.rollbackTransaction();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
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
      await this.dataSourceManager.releaseConnection();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }

  async deleteTicker(name: string): Promise<TickerModel> {
    await this.dataSourceManager.startTransaction();

    try {
      const Ticker = await this.dataSourceManager
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
      return Ticker;
    } catch (error) {
      await this.dataSourceManager.rollbackTransaction();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }

  async updateTicker(
    createTickerInput: CreateTickerInput,
  ): Promise<TickerModel> {
    await this.dataSourceManager.startTransaction();

    try {
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

      return createTickerInput;
    } catch (error) {
      await this.dataSourceManager.rollbackTransaction();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }
}
