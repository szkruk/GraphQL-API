import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common';
import { NotFoundError } from 'rxjs';
import { TickerModel } from 'src/tickers/model/ticker.model';
import { TickersService } from 'src/tickers/tickers.service';
import { DataSource } from 'typeorm';
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
    try {
      const Quotes = await this.quotesRepository.find();
      return Quotes;
    } catch (error) {
      throw new NotImplementedException('Coś nie tak', {
        cause: new Error(),
        description: 'Jakis blad',
      });
    }
  }

  async findOne(name: string, timestamp: number): Promise<QuoteModel> {
    try {
      const Quote: QuoteModel = await this.quotesRepository.findOneByOrFail({
        name: name,
        timestamp: timestamp,
      });
      return Quote;
    } catch (error) {
      throw new NotImplementedException('Value not founded', {
        cause: new Error(),
        description: 'There are not qoutes with this name and timestamp',
      });
    }
  }

  async findAllByTimeStamp(timestamp: number): Promise<QuoteModel[]> {
    try {
      const quotes: QuoteModel[] = await this.quotesRepository.findBy({
        timestamp: timestamp,
      });
      return quotes;
    } catch (error) {
      throw new NotImplementedException('Value not founded', {
        cause: new Error(),
        description: 'There are not any qoutes with this timestamp',
      });
    }
  }

  async findAllByName(name: string): Promise<QuoteModel[]> {
    try {
      const quotes: QuoteModel[] = await this.quotesRepository.findBy({
        name: name,
      });
      return quotes;
    } catch (error) {
      throw new NotImplementedException('Value not founded', {
        cause: new Error(),
        description: 'There are not any qoutes with this name ',
      });
    }
  }

  async findTicker(name: string): Promise<TickerModel> {
    try {
      return this.tickersService.findOne(name);
    } catch (error) {
      throw new NotImplementedException('Value not founded', {
        cause: new Error(),
        description: 'There are not any qoutes with this name ',
      });
    }
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
