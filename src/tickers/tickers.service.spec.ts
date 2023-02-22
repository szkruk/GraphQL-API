import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TickerEntity } from './entities/ticker.entity';
import { TickersService } from './tickers.service';

describe('TickersService', () => {
  let service: TickersService;

  const mockTickerRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TickersService,
        {
          provide: getRepositoryToken(TickerEntity),
          useValue: mockTickerRepository,
        },
      ],
    }).compile();

    service = module.get<TickersService>(TickersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
