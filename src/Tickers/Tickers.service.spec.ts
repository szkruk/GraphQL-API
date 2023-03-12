import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { clear } from 'console';
import { DataSource } from 'typeorm';
import { CreateTickerInput } from './dto/Create-Ticker.input';
import { TickerEntity } from './entities/Ticker.entity';
import { TickerModel } from './model/Ticker.model';
import { TickersService } from './Tickers.service';

describe('TickersService', () => {
  let service: TickersService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: 'env/.env',
        }),

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
            entities: [TickerEntity],
            synchronize: true,
          }),
        }),
        TypeOrmModule.forFeature([TickerEntity]),
      ],
      providers: [TickersService, TickerEntity],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);

    service = module.get<TickersService>(TickersService);
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

  async function initData() {
    await clearDB();

    await service.create({
      name: 'TSL',
      fullName: 'Tesla',
    });
  }

  beforeEach(async () => {
    await initData();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(dataSource).toBeDefined();
  });

  describe('create a Ticker', () => {
    let Ticker: TickerModel;

    const createTicker: CreateTickerInput = {
      name: 'INTC',
      fullName: 'Intel',
    };

    beforeEach(async () => {
      await initData();

      Ticker = await service.create(createTicker);
    });

    it('should be defined', () => {
      expect(Ticker).toBeDefined();
    });

    it('should return a Ticker', () => {
      expect(Ticker).toEqual(createTicker);
    });

    it('should return a error', async () => {
      await expect(service.create(createTicker)).rejects.toThrow(
        'Ticker already exists',
      );
    });
  });

  describe('get all tickers', () => {
    let Tickers: TickerModel[];

    beforeEach(async () => {
      await initData();

      await service.create({
        name: 'INTC',
        fullName: 'Intel',
      });

      Tickers = await service.findAll();
    });

    it('should be defined', () => {
      expect(Tickers).toBeDefined();
    });

    it('Should return two tickers', async () => {
      expect(Tickers).toEqual(
        expect.arrayContaining([
          {
            name: 'TSL',
            fullName: 'Tesla',
          },
          {
            name: 'INTC',
            fullName: 'Intel',
          },
        ]),
      );
    });
  });

  describe('get one ticker', () => {
    let Ticker: TickerModel;

    beforeEach(async () => {
      await initData();

      Ticker = await service.findOne('TSL');
    });

    it('should be defined', () => {
      expect(Ticker).toBeDefined();
    });

    it('Should return one ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'Tesla',
      });
    });

    it('should return a error', async () => {
      await expect(service.findOne('TSLS')).rejects.toThrow('Ticker not found');
    });
  });

  describe('delete ticker', () => {
    let Ticker: TickerModel;

    beforeEach(async () => {
      await initData();

      Ticker = await service.deleteTicker('TSL');
    });

    it('should be defined', () => {
      expect(Ticker).toBeDefined();
    });

    it('Should return ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'Tesla',
      });
    });

    it('Should return a error', async () => {
      await expect(service.deleteTicker('TSLS')).rejects.toThrow(
        'Value not founded',
      );
    });
  });

  describe('update ticker', () => {
    let Ticker: TickerModel;

    beforeEach(async () => {
      await initData();

      Ticker = await service.updateTicker({ name: 'TSL', fullName: 'Teslaa' });
    });

    it('should be defined', () => {
      expect(Ticker).toBeDefined();
    });

    it('Should return one ticker', async () => {
      expect(Ticker).toEqual({ name: 'TSL', fullName: 'Teslaa' });
    });

    it('Should return a error', async () => {
      await expect(
        service.updateTicker({ name: 'TSLL', fullName: 'Tesla' }),
      ).rejects.toThrow('There is no ticker like this');
    });
  });
});
