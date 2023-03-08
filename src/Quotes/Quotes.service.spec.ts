import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TickerEntity } from '../Tickers/entities/Ticker.entity';
import { TickersModule } from '../Tickers/Tickers.module';
import { CreateQuoteInput } from './dto/Create-Quote.input';
import { QuoteEntity } from './entities/Quote.entity';
import { QuoteModel } from './model/Quote.model';
import { QuotesService } from './Quotes.service';

describe('QuotesService', () => {
  let service: QuotesService;

  let repository: Repository<QuoteEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: 'src/env/.env',
        }),
        TickersModule,

        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],

          inject: [ConfigService],

          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('POSTGRES_HOST'),
            port: +configService.get('POSTGRES_PORT'),
            username: configService.get('POSTGRES_USER'),
            password: configService.get('POSTGRES_PASSWORD'),
            database: configService.get('POSTGRES_NAME'),
            entities: [QuoteEntity, TickerEntity],
            synchronize: true,
          }),
        }),
        TypeOrmModule.forFeature([QuoteEntity]),
      ],
      providers: [QuotesService, QuoteEntity],
    }).compile();

    repository = module.get<Repository<QuoteEntity>>(
      getRepositoryToken(QuoteEntity),
    );

    service = module.get<QuotesService>(QuotesService);
  });

  async function clearDB() {
    const connection = repository.manager.connection;

    const queryRunner = connection.createQueryRunner();

    await queryRunner.startTransaction('SERIALIZABLE');

    const entities = connection.entityMetadatas;
    for (const entity of entities) {
      const repository = connection.getRepository(entity.name);

      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }

    await queryRunner.commitTransaction();

    await queryRunner.release();
  }

  async function initData() {
    await clearDB();

    await service.createQuote({
      name: 'TSL',
      timestamp: 123,
      price: 12.3,
    });
  }

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Get all quotes', () => {
    let Quotes: QuoteModel[];

    beforeAll(async () => {
      await initData();

      await service.createQuote({
        name: 'INTC',
        timestamp: 123,
        price: 12.3,
      });

      Quotes = await service.findAll();
    });

    it('Should be defined', () => {
      expect(Quotes).toBeDefined();
    });

    it('Should return two quotes', async () => {
      expect(Quotes).toEqual([
        {
          name: 'TSL',
          timestamp: 123,
          price: 12.3,
        },
        {
          name: 'INTC',
          timestamp: 123,
          price: 12.3,
        },
      ]);
    });
  });

  describe('Get one Quote', () => {
    let Quote: QuoteModel;

    beforeAll(async () => {
      await initData();

      Quote = await service.findOne('TSL', 123);
    });

    it('Should be defined', () => {
      expect(Quote).toBeDefined();
    });

    it('Should return quote', async () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 123,
        price: 12.3,
      });
    });

    it('Should return a error', async () => {
      await expect(service.findOne('TSL', 1234)).rejects.toThrow(
        'Value not founded',
      );
    });
  });

  describe('Get quotes by timestamp', () => {
    let Quotes: QuoteModel[];

    beforeAll(async () => {
      await initData();
      await service.createQuote({
        name: 'INTC',
        timestamp: 123,
        price: 12.3,
      });
      Quotes = await service.findAllByTimestamp(123);
    });

    it('Should be defined', () => {
      expect(Quotes).toBeDefined();
    });

    it('Should return quotes with same timestamp', async () => {
      expect(Quotes).toEqual([
        {
          name: 'TSL',
          timestamp: 123,
          price: 12.3,
        },
        {
          name: 'INTC',
          timestamp: 123,
          price: 12.3,
        },
      ]);
    });

    it('Should return a error', async () => {
      await expect(service.findAllByTimestamp(1222)).rejects.toThrow(
        'No records for this timestamp',
      );
    });
  });

  describe('Get quotes by Name', () => {
    let Quotes: QuoteModel[];

    beforeAll(async () => {
      await initData();
      await service.createQuote({
        name: 'TSL',
        timestamp: 124,
        price: 12.3,
      });
      Quotes = await service.findAllByName('TSL');
    });

    it('Should be defined', () => {
      expect(Quotes).toBeDefined();
    });

    it('Should return quotes with same name', async () => {
      expect(Quotes).toEqual([
        {
          name: 'TSL',
          timestamp: 123,
          price: 12.3,
        },
        {
          name: 'TSL',
          timestamp: 124,
          price: 12.3,
        },
      ]);
    });

    it('Should return a error', async () => {
      await expect(service.findAllByName('AAA')).rejects.toThrow(
        'There is no ticker with this name',
      );
    });
  });

  describe('Create a quote', () => {
    let Quote: QuoteModel;

    const createQuote: CreateQuoteInput = {
      name: 'TSL',
      timestamp: 124,
      price: 12.3,
    };

    beforeAll(async () => {
      await initData();

      Quote = await service.createQuote(createQuote);
    });

    it('Should be defined', () => {
      expect(Quote).toBeDefined();
    });

    it('Should return a quote', () => {
      expect(Quote).toEqual(createQuote);
    });

    it('Should return a error', async () => {
      await expect(service.createQuote(createQuote)).rejects.toThrow(
        'Qoute already exists',
      );
    });
  });

  describe('Update quote', () => {
    let Quote: QuoteModel;

    const createQuote: CreateQuoteInput = {
      name: 'TSL',
      timestamp: 123,
      price: 16.3,
    };

    beforeAll(async () => {
      await initData();

      Quote = await service.update(createQuote);
    });

    it('Should be defined', () => {
      expect(Quote).toBeDefined();
    });

    it('Should return updated quote', () => {
      expect(Quote).toEqual(createQuote);
    });

    it('Should return a error', async () => {
      await expect(
        service.update({
          name: 'TSLA',
          timestamp: 123,
          price: 16.3,
        }),
      ).rejects.toThrow("Quote doesn't exists");
    });
  });

  describe('Delete quote', () => {
    let Quote: QuoteModel;

    beforeAll(async () => {
      await initData();

      Quote = await service.deleteQuote('TSL', 123);
    });

    it('Should be defined', () => {
      expect(Quote).toBeDefined();
    });

    it('Should return deleted quote', () => {
      expect(Quote).toEqual({ name: 'TSL', timestamp: 123, price: 12.3 });
    });

    it('should return a error', async () => {
      await expect(service.deleteQuote('TSL', 123)).rejects.toThrow(
        "Quote doesn't exists",
      );
    });
  });
});
