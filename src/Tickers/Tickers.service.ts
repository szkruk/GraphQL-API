/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseException } from '../common/Database.exception';
import {
  checkIfErrorOccurs,
  throwBadRequestOrDatabaseError,
} from '../common/ErrorHandling';
import { CreateTickerInput } from './dto/Create-Ticker.input';
import { TickerEntity } from './entities/Ticker.entity';
import { TickerModel } from './model/Ticker.model';

@Injectable()
export class TickersService {
  constructor(private readonly dataSource: DataSource) {}
  private readonly delayMs = 1000;

  async findAll(): Promise<TickerModel[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const Tickers = await queryRunner.manager.find(TickerEntity);

      await queryRunner.manager.release();

      return Tickers;
    } catch {
      await queryRunner.manager.release();

      throw new DatabaseException();
    }
  }

  async create(createTickerInput: CreateTickerInput): Promise<TickerModel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    let attempt = 0;

    while (true) {
      try {
        await queryRunner.startTransaction('SERIALIZABLE');

        if (
          (await queryRunner.manager.findOne(TickerEntity, {
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

        await queryRunner.manager.insert(TickerEntity, {
          ...createTickerInput,
        });

        await queryRunner.commitTransaction();
        await queryRunner.release();

        // If transactian was succesfull loop is broken
        break;
      } catch (error) {
        await checkIfErrorOccurs(queryRunner, error, attempt);

        await queryRunner.rollbackTransaction();
        attempt += 1;

        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
    }
    return createTickerInput;
  }

  async findOne(name: string): Promise<TickerModel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const Ticker = await queryRunner.manager.findOne(TickerEntity, {
        where: {
          name: name,
        },
      });
      if (Ticker == null) {
        throw new BadRequestException('Ticker not found', {
          description: 'Ticker with this name doesnt exist',
        });
      }

      await queryRunner.manager.release();

      return Ticker;
    } catch (error) {
      await queryRunner.release();
      await throwBadRequestOrDatabaseError(error);
    }
  }

  async deleteTicker(name: string): Promise<TickerModel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    let attempt = 0;
    let Ticker;

    while (true) {
      try {
        await queryRunner.startTransaction('SERIALIZABLE');

        Ticker = await queryRunner.manager.findOne(TickerEntity, {
          where: {
            name: name,
          },
        });

        if (Ticker == null) {
          throw new BadRequestException('Value not founded', {
            description: 'There is not ticker with this name.',
          });
        } else {
          await queryRunner.manager.delete(TickerEntity, { ...Ticker });
        }

        await queryRunner.commitTransaction();
        await queryRunner.release();

        // If transactian was succesfull loop is broken
        break;
      } catch (error) {
        await checkIfErrorOccurs(queryRunner, error, attempt);

        await queryRunner.rollbackTransaction();
        attempt += 1;

        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
    }

    return Ticker;
  }

  async updateTicker(
    createTickerInput: CreateTickerInput,
  ): Promise<TickerModel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    let attempt = 0;

    while (true) {
      try {
        await queryRunner.startTransaction('SERIALIZABLE');

        const Ticker = await queryRunner.manager.findOne(TickerEntity, {
          where: {
            name: createTickerInput.name,
          },
        });

        if (Ticker != null) {
          await queryRunner.manager.update(
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

        await queryRunner.commitTransaction();
        await queryRunner.release();

        // If transactian was succesfull loop is broken
        break;
      } catch (error) {
        await checkIfErrorOccurs(queryRunner, error, attempt);

        await queryRunner.rollbackTransaction();
        attempt += 1;

        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
    }

    return createTickerInput;
  }
}
