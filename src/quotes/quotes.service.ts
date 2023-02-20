import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common';
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

  async findAllByTimeStamp(timestamp: number): Promise<QuoteModel[]> {
    return this.quotesRepository.findBy({});
  }

  async findAllByName(name: string): Promise<QuoteModel[]> {
    return this.quotesRepository.findBy({
      name: name,
    });
  }

  async findTicker(name: string): Promise<TickerModel> {
    return this.tickersService.findOne(name);
  }

  // TODO!!!!   Wziąć przypadek istniejącego rekordu (duplikowanie)
  async createQuote(createQuoteInput: CreateQuoteInput): Promise<QuoteModel> {
    try {
      const temp = await this.tickersService.findOne(createQuoteInput.name);
    } catch (EntityNotFoundError) {
      await this.tickersService.create({
        name: createQuoteInput.name,
        fullName: 'unknown',
      });
      const newQuote = this.quotesRepository.create(createQuoteInput);
      return this.quotesRepository.save(newQuote);
    }

    const newQuote = this.quotesRepository.create(createQuoteInput);
    return this.quotesRepository.save(newQuote);
  }

  async editQuote(createQuoteInput: CreateQuoteInput): Promise<QuoteModel> {
    await this.quotesRepository.update(
      {
        name: createQuoteInput.name,
        timestamp: createQuoteInput.timestamp,
      },
      { ...createQuoteInput },
    );

    const Quote = await this.quotesRepository.findOne({
      where: {
        name: createQuoteInput.name,
        timestamp: createQuoteInput.timestamp,
      },
    });
    return Quote;
  }

  async deleteQuote(name: string, timestamp: number): Promise<QuoteModel> {
    const Quote = await this.quotesRepository.findOne({
      where: {
        name: name,
        timestamp: timestamp,
      },
    });
    await this.quotesRepository.delete(Quote);

    return Quote;
  }
}
