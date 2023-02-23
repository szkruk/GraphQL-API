import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseException } from '../common/database.exception';
import { CreateTickerInput } from './dto/create-ticker.input';
import { TickerEntity } from './entities/ticker.entity';
import { TickerModel } from './model/ticker.model';

@Injectable()
export class TickersService {
  constructor(
    @InjectRepository(TickerEntity)
    private tickersRepository: Repository<TickerEntity>,
  ) {}

  async findAll(): Promise<TickerModel[]> {
    try {
      return await this.tickersRepository.find();
    } catch {
      throw new DatabaseException();
    }
  }

  async create(createTickerInput: CreateTickerInput): Promise<TickerModel> {
    const queryRunner =
      this.tickersRepository.manager.connection.createQueryRunner();

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
          cause: new Error(),
          description: 'You are trying to create ticker, which already exists.',
        });
      }

      const newTicker = this.tickersRepository.create(createTickerInput);
      await this.tickersRepository.save(newTicker);

      await queryRunner.commitTransaction();

      await queryRunner.release();

      return newTicker;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw error;
      }
    }
  }

  async findOne(name: string): Promise<TickerModel> {
    try {
      const Ticker = await this.tickersRepository.manager.findOne(
        TickerEntity,
        {
          where: {
            name: name,
          },
        },
      );

      if (Ticker == null) {
        throw new BadRequestException('Ticker not found', {
          cause: new Error(),
          description: 'Ticker with this name doesnt exist',
        });
      }

      return Ticker;
    } catch (error) {
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

    try {
      await queryRunner.startTransaction('SERIALIZABLE');

      const Ticker = await queryRunner.manager.findOne(TickerEntity, {
        where: {
          name: name,
        },
      });
      if (Ticker == null) {
        throw new BadRequestException('Value not founded', {
          cause: new Error(),
          description: 'There is not ticker with this name ',
        });
      } else {
        await this.tickersRepository.delete(Ticker);
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
    try {
      await queryRunner.startTransaction('SERIALIZABLE');

      const Ticker = await this.tickersRepository.findOne({
        where: {
          name: createTickerInput.name,
        },
      });

      if (Ticker !== null) {
        await this.tickersRepository.update(
          {
            name: createTickerInput.name,
          },
          { ...createTickerInput },
        );
      } else {
        throw new BadRequestException('There is no ticker like this', {
          cause: new Error(),
          description: 'There is no ticker like this ',
        });
      }

      Ticker.fullName = createTickerInput.fullName;

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
}
