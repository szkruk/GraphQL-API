import { Test, TestingModule } from '@nestjs/testing';
import { TickersResolver } from './tickers.resolver';
import { TickersService } from './tickers.service';

describe('TickersResolver', () => {
  let resolver: TickersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TickersResolver, TickersService],
    }).compile();

    resolver = module.get<TickersResolver>(TickersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
