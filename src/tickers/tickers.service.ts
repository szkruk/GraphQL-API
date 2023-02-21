import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    } catch (error) {
      throw new NotImplementedException('Something with database', {
        cause: new Error(),
        description: 'Nie wiadomo',
      });
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
        throw new NotImplementedException('Ticker already exists', {
          cause: new Error(),
          description: 'Ticker already exists',
        });
      }

      const newTicker = this.tickersRepository.create(createTickerInput);
      await this.tickersRepository.save(newTicker);

      queryRunner.commitTransaction();

      queryRunner.release();

      return newTicker;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw error;
    }
  }

  async findOne(name: string): Promise<TickerModel> {
    try {
      return await this.tickersRepository.findOneByOrFail({ name: name });
    } catch (error) {
      throw new NotImplementedException('Value not founded', {
        cause: new Error(),
        description: 'There is not ticker with this name ',
      });
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
        throw new NotImplementedException('Value not founded', {
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
      throw error;
    }
  }

  async editTicker(createTickerInput: CreateTickerInput): Promise<TickerModel> {
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
        throw new NotImplementedException('There is no ticker like this', {
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

      throw error;
    }
  }
}
