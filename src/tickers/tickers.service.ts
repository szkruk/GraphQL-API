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
    return this.tickersRepository.find();
  }

  async create(createTickerInput: CreateTickerInput): Promise<TickerModel> {
    const newTicker = this.tickersRepository.create(createTickerInput);
    return this.tickersRepository.save(newTicker);
  }

  async findOne(name: string): Promise<TickerModel> {
    return this.tickersRepository.findOneByOrFail({ name: name });
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
