import { Injectable } from '@nestjs/common';
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
    return await this.tickersRepository.find();
  }

  async create(createTickerInput: CreateTickerInput): Promise<TickerModel> {
    const newTicker = this.tickersRepository.create(createTickerInput);
    return await this.tickersRepository.save(newTicker);
  }

  async findOne(name: string): Promise<TickerModel> {
    return await this.tickersRepository.findOneByOrFail({ name: name });
  }

  async deleteTicker(name: string): Promise<TickerModel> {
    const Ticker = await this.tickersRepository.findOne({
      where: {
        name: name,
      },
    });
    await this.tickersRepository.delete(Ticker);
    return Ticker;
  }

  async editTicker(createTickerInput: CreateTickerInput): Promise<TickerModel> {
    await this.tickersRepository.update(
      {
        name: createTickerInput.name,
      },
      { ...createTickerInput },
    );

    const Ticker = await this.tickersRepository.findOne({
      where: {
        name: createTickerInput.name,
      },
    });
    return Ticker;
  }
}
