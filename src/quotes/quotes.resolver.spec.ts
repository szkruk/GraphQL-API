import { Test, TestingModule } from '@nestjs/testing';
import { TickerModel } from '../tickers/model/ticker.model';
import { TickersModule } from 'src/tickers/tickers.module';
import { QuotesResolver } from './quotes.resolver';
import { QuotesService } from './quotes.service';

describe('QuotesResolver', () => {
  let resolver: QuotesResolver;

  const mockQuoteService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuotesResolver, QuotesService, TickerModel],
    })
      .overrideProvider(QuotesService)
      .useValue(mockQuoteService)
      .compile();

    resolver = module.get<QuotesResolver>(QuotesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
