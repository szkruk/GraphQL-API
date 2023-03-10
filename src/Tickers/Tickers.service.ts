import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseException } from '../common/database.exception';
import { CreateTickerInput } from './dto/Create-Ticker.input';
import { TickerEntity } from './entities/Ticker.entity';
import { TickerModel } from './model/Ticker.model';

@Injectable()
export class TickersService {
  constructor(
    @InjectRepository(TickerEntity)
    private tickersRepository: Repository<TickerEntity>,
  ) {}

  async findAll(): Promise<TickerModel[]> {
    const queryRunner =
      this.tickersRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();

    try {
      const Tickers = await queryRunner.manager.find(TickerEntity);

      await queryRunner.release();

      return Tickers;
    } catch {
      await queryRunner.release();

      throw new DatabaseException();
    }
  }

  async create(createTickerInput: CreateTickerInput): Promise<TickerModel> {
    const queryRunner =
      this.tickersRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();

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
          description: 'You are trying to create ticker, which already exists.',
        });
      }

      await queryRunner.manager.insert(TickerEntity, {
        ...createTickerInput,
      });

      await queryRunner.commitTransaction();

      await queryRunner.release();

      return createTickerInput;
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

  async findOne(name: string): Promise<TickerModel> {
    const queryRunner =
      this.tickersRepository.manager.connection.createQueryRunner();

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

      await queryRunner.release();

      return Ticker;
    } catch (error) {
      await queryRunner.release();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new DatabaseException();
      }
    }
  }

  async deleteTicker(name: string): Promise<TickerModel> {
    const queryRunner =
      this.tickersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction('SERIALIZABLE');

      const Ticker = await queryRunner.manager.findOne(TickerEntity, {
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

      return Ticker;
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

  async updateTicker(
    createTickerInput: CreateTickerInput,
  ): Promise<TickerModel> {
    const queryRunner =
      this.tickersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();

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

      return createTickerInput;
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
