import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TickerEntity } from './entities/ticker.entity';
import { TickerModel } from './model/ticker.model';
import { TickersService } from './tickers.service';

describe('TickersService', () => {
  let service: TickersService;

  const mockTickerRepository = {
    find: jest.fn(() => Promise.resolve([TickerModel])),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [
      //   ConfigModule.forRoot({
      //     envFilePath: 'src/env/.env',
      //   }),

      //   TypeOrmModule.forRoot({
      //     type: 'postgres',
      //     host: process.env.POSTGRES_HOST,
      //     port: parseInt(process.env.POSTGRES_PORT),
      //     username: process.env.POSTGRES_USER,
      //     password: process.env.POSTGRES_PASSWORD,
      //     database: process.env.POSTGRES_NAME,
      //     entities: ['dist/**/*.entity.js'],
      //     synchronize: true,
      //   }),
      // ],
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
