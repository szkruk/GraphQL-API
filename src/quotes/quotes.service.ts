import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common';
import { TickerEntity } from 'src/tickers/entities/ticker.entity';
import { TickerModel } from 'src/tickers/model/ticker.model';
import { TickersService } from 'src/tickers/tickers.service';
import { Repository } from 'typeorm/repository/Repository';
import { CreateQuoteInput } from './dto/create-quote.input';
import { QuoteEntity } from './entities/quote.entity';
import { QuoteModel } from './model/quote.model';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(QuoteEntity)
    private quotesRepository: Repository<QuoteEntity>,
    private tickersService: TickersService,
  ) {}
  async findAll(): Promise<QuoteModel[]> {
    return this.quotesRepository.find();
  }

  async findOne(name: string, timestamp: number): Promise<QuoteModel> {
    return this.quotesRepository.findOneByOrFail({
      name: name,
      timestamp: timestamp,
    });
  }

  async findAllByName(name: string): Promise<QuoteModel[]> {
    return this.quotesRepository.findBy({
      name: name,
    });
  }

  async findTicker(name: string): Promise<TickerModel> {
    return this.tickersService.findOne(name);
  }

  async createQuote(createQuoteInput: CreateQuoteInput): Promise<QuoteModel> {
    const newQuote = this.quotesRepository.create(createQuoteInput);
    return this.quotesRepository.save(newQuote);
  }
}
