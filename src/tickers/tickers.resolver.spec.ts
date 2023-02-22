import { Test, TestingModule } from '@nestjs/testing';
import { TickersResolver } from './tickers.resolver';
import { TickersService } from './tickers.service';
import { TickerModel } from './model/ticker.model';
import { CreateTickerInput } from './dto/create-ticker.input';

describe('TickersResolver', () => {
  let resolver: TickersResolver;

  const mockTickersService = {
    create: jest.fn((createTickerInput: CreateTickerInput) => {
      return {
        ...createTickerInput,
      };
    }),

    updateTicker: jest.fn((createTickerInput: CreateTickerInput) => {
      return { ...createTickerInput };
    }),

    deleteTicker: jest.fn((name: string) => {
      return { name: name, fullName: expect.any(String) };
    }),

    findAll: jest.fn(() => {
      let Tickers: TickerModel[] = [
        {
          name: 'TSL',
          fullName: 'Tesla',
        },
        {
          name: 'BIDU',
          fullName: 'Baidu',
        },
      ];

      return Tickers;
    }),

    findOne: jest.fn((name: string) => {
      return { name: name, fullName: expect.any(String) };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TickersResolver, TickersService],
    })
      .overrideProvider(TickersService)
      .useValue(mockTickersService)
      .compile();

    resolver = module.get<TickersResolver>(TickersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('create a Ticker', () => {
    let Ticker: TickerModel;
    beforeAll(async () => {
      Ticker = await resolver.createTicker({
        name: 'TSL',
        fullName: 'Tesla',
      });
    });
    it('should return a TickerModel', async () => {
      expect(Ticker).toBeDefined();
    });

    it('should create a Ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'Tesla',
      });
    });
  });

  describe('update a Ticker', () => {
    let Ticker: TickerModel;
    beforeAll(async () => {
      Ticker = await resolver.updateTicker({
        name: 'TSL',
        fullName: 'Tesla',
      });
    });

    it('should return a TickerModel', async () => {
      expect(Ticker).toBeDefined();
    });

    it('should update a Ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'Tesla',
      });
    });
  });

  describe('delete a Ticker', () => {
    let Ticker: TickerModel;
    beforeAll(async () => {
      Ticker = await resolver.deleteTicker('TSL');
    });

    it('should return a TickerModel', async () => {
      expect(Ticker).toBeDefined();
    });

    it('should return deleted Ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: expect.any(String),
      });
    });
  });

  describe('get all Tickers', () => {
    let Tickers: TickerModel[];
    beforeAll(async () => {
      Tickers = await resolver.findAll();
    });
    it('should returns array of Tickers', async () => {
      expect(Array.isArray(Tickers)).toBe(true);
    });

    it('should return array with lenght equal to 2', async () => {
      expect(Tickers.length).toEqual(2);
    });
    it('should return two tickers', () => {
      async () => {
        expect(Tickers).toEqual([
          {
            name: 'TSL',
            fullName: 'Tesla',
          },
          {
            name: 'BIDU',
            fullName: 'Baidu',
          },
        ]);
      };
    });
  });

  describe('get one Ticker', () => {
    let Ticker: TickerModel;
    beforeAll(async () => {
      Ticker = await resolver.findOne('TSL');
    });

    it('should return a TickerModel object', async () => {
      expect(Ticker).toBeDefined();
    });

    it('should return one specific Ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: expect.any(String),
      });
    });
  });
});
