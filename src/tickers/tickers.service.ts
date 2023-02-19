import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTickerInput } from './dto/create-ticker.input';
import { UpdateTickerInput } from './dto/update-ticker.input';
import { Ticker } from './entities/ticker.entity';

@Injectable()
export class TickersService {
  constructor(
    @InjectRepository(Ticker) private tickersRepository: Repository<Ticker>,
  ) {}

  async findAll(): Promise<Ticker[]> {
    return this.tickersRepository.find();
  }

  async create(createTickerInput: CreateTickerInput): Promise<Ticker> {
    const newTicker = this.tickersRepository.create(createTickerInput);
    return this.tickersRepository.save(newTicker);
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} ticker`;
  // }

  // update(id: number, updateTickerInput: UpdateTickerInput) {
  //   return `This action updates a #${id} ticker`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} ticker`;
  // }
}
