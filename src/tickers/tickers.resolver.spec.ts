import { Test, TestingModule } from '@nestjs/testing';
import { TickersResolver } from './tickers.resolver';
import { TickersService } from './tickers.service';
import { TickerModel } from './model/ticker.model';
import { CreateTickerInput } from './dto/create-ticker.input';

describe('TickersResolver', () => {
  let resolver: TickersResolver;

  const mockTickersService = {
    create: jest.fn((createTickerInput: CreateTickerInput) => {
      return Promise.resolve({
        ...createTickerInput,
      });
    }),

    updateTicker: jest.fn((createTickerInput: CreateTickerInput) => {
      return Promise.resolve({ ...createTickerInput });
    }),

    deleteTicker: jest.fn((name: string) => {
      return Promise.resolve({ name: name, fullName: expect.any(String) });
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

      return Promise.resolve(Tickers);
    }),

    findOne: jest.fn((name: string) => {
      return Promise.resolve({ name: name, fullName: expect.any(String) });
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

  it('Should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('Create a ticker', () => {
    let Ticker: TickerModel;
    beforeAll(async () => {
      Ticker = await resolver.createTicker({
        name: 'TSL',
        fullName: 'Tesla',
      });
    });
    it('Should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('Should create a ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'Tesla',
      });
    });
  });

  describe('Update a ticker', () => {
    let Ticker: TickerModel;
    beforeAll(async () => {
      Ticker = await resolver.updateTicker({
        name: 'TSL',
        fullName: 'Tesla',
      });
    });

    it('Should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('Should update a ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'Tesla',
      });
    });
  });

  describe('Delete a ticker', () => {
    let Ticker: TickerModel;
    beforeAll(async () => {
      Ticker = await resolver.deleteTicker('TSL');
    });

    it('Should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('Should return deleted ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: expect.any(String),
      });
    });
  });

  describe('Get all tickers', () => {
    let Tickers: TickerModel[];
    beforeAll(async () => {
      Tickers = await resolver.findAll();
    });
    it('Should returns array of tickers', async () => {
      expect(Array.isArray(Tickers)).toBe(true);
    });

    it('Should return array with length equal to 2', async () => {
      expect(Tickers.length).toEqual(2);
    });
    it('Should return two tickers', () => {
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

    it('Should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('Should return one specific ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: expect.any(String),
      });
    });
  });
});
