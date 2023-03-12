import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TickerEntity } from '../Tickers/entities/Ticker.entity';
import { TickersModule } from '../Tickers/Tickers.module';
import { CreateQuoteInput } from './dto/Create-Quote.input';
import { QuoteEntity } from './entities/Quote.entity';
import { QuoteModel } from './model/Quote.model';
import { QuotesService } from './Quotes.service';

describe('QuotesService', () => {
  let service: QuotesService;
  let dataSource: DataSource;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: 'env/.env',
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
            database: 'postgres',
            entities: [QuoteEntity, TickerEntity],
            synchronize: true,
          }),
        }),
        TypeOrmModule.forFeature([QuoteEntity]),
      ],
      providers: [QuotesService, QuoteEntity],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);

    service = module.get<QuotesService>(QuotesService);
  });

  async function clearDB() {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction('SERIALIZABLE');

    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }

    await queryRunner.commitTransaction();

    await queryRunner.release();
  }

  beforeEach(async () => {
    await initData();
  });

  async function initData() {
    await clearDB();

    await service.createQuote({
      name: 'TSL',
      timestamp: 123,
      price: 12.3,
    });
  }

  async function insertDelayed(newQ: CreateQuoteInput, delayMs: number) {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction('SERIALIZABLE');

    await queryRunner.manager.insert(QuoteEntity, newQ);

    await new Promise((resolve) => setTimeout(resolve, delayMs));

    await queryRunner.commitTransaction();

    await queryRunner.release();
  }

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should be defined', () => {
    expect(dataSource).toBeDefined();
  });

  describe('Get all quotes', () => {
    let Quotes: QuoteModel[];

    beforeEach(async () => {
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
      expect(Quotes).toEqual(
        expect.arrayContaining([
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
        ]),
      );
    });
  });

  describe('Get one Quote', () => {
    let Quote: QuoteModel;

    beforeEach(async () => {
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

    beforeEach(async () => {
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
      expect(Quotes).toEqual(
        expect.arrayContaining([
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
        ]),
      );
    });

    it('Should return a error', async () => {
      await expect(service.findAllByTimestamp(1222)).rejects.toThrow(
        'No records for this timestamp',
      );
    });
  });

  describe('Get quotes by Name', () => {
    let Quotes: QuoteModel[];

    beforeEach(async () => {
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
      expect(Quotes).toEqual(
        expect.arrayContaining([
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
        ]),
      );
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

    beforeEach(async () => {
      Quote = await service.createQuote(createQuote);
    });

    it('Should be defined', () => {
      expect(Quote).toBeDefined();
    });

    it('Should return a quote', () => {
      expect(Quote).toEqual(createQuote);
    });

    it('Should return a created quote', async () => {
      await expect(
        service.findOne(createQuote.name, createQuote.timestamp),
      ).resolves.toEqual(createQuote);
    });

    it('Should return a error', async () => {
      await expect(service.createQuote(createQuote)).rejects.toThrow(
        'Qoute already exists',
      );
    });

    it('Ticker shouldnt exist', async () => {
      expect(
        await dataSource.manager.findOne(TickerEntity, {
          where: {
            name: 'SEE',
          },
        }),
      ).toEqual(null);
    });

    it('Should create a new Ticker and Quote', async () => {
      const newQuote: CreateQuoteInput = {
        name: 'SEE',
        timestamp: 124,
        price: 21.3,
      };

      expect(await service.createQuote(newQuote)).toEqual(newQuote);

      expect(
        await dataSource.manager.findOne(TickerEntity, {
          where: {
            name: 'SEE',
          },
        }),
      ).toEqual({ fullName: 'unknown', name: 'SEE' });
    });

    it('Should return error, while concurently inserting same Quote', async () => {
      const newQuote: CreateQuoteInput = {
        name: 'TSL',
        timestamp: 100,
        price: 42000,
      };

      const resp = insertDelayed(newQuote, 1000);
      await expect(service.createQuote(newQuote)).rejects.toThrow(
        'Qoute already exists',
      );
    });

    it('Should create Ticker, for first Quote and accept second Quote ', async () => {
      const bitcoinQuote: CreateQuoteInput = {
        name: 'BTC',
        timestamp: 100,
        price: 42000,
      };

      expect(
        await dataSource.manager.findOne(TickerEntity, {
          where: {
            name: 'BTC',
          },
        }),
      ).toEqual(null);

      // Ticker is not created, so the response is Error
      await expect(insertDelayed(bitcoinQuote, 1000)).rejects.toThrowError();

      expect(await service.createQuote(bitcoinQuote)).toEqual(bitcoinQuote);

      expect(
        await dataSource.manager.findOne(TickerEntity, {
          where: {
            name: 'BTC',
          },
        }),
      ).toEqual({ fullName: 'unknown', name: 'BTC' });
    });
  });

  describe('Update quote', () => {
    let Quote: QuoteModel;

    const createQuote: CreateQuoteInput = {
      name: 'TSL',
      timestamp: 123,
      price: 16.3,
    };

    beforeEach(async () => {
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

    beforeEach(async () => {
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
