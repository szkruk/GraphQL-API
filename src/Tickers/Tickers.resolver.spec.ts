import { Test, TestingModule } from '@nestjs/testing';
import { TickersResolver } from './Tickers.resolver';
import { TickerModel } from './model/Ticker.model';
import { CreateTickerInput } from './dto/Create-Ticker.input';
import { TickersService } from './Tickers.service';

describe('TickersResolver', () => {
  let resolver: TickersResolver;
  let tickersService: TickersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TickersResolver,
        {
          provide: TickersService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            deleteTicker: jest.fn(),
            updateTicker: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<TickersResolver>(TickersResolver);
    tickersService = module.get<TickersService>(TickersService);
  });

  it('Should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('Should be defined', () => {
    expect(tickersService).toBeDefined();
  });

  describe('Create a ticker', () => {
    const createInput: CreateTickerInput = {
      name: 'TSL',
      fullName: 'Tesla',
    };

    it('Should be defined', async () => {
      jest.spyOn(tickersService, 'create').mockResolvedValue(createInput);

      expect(await resolver.createTicker(createInput)).toBeDefined();
    });

    it('Should create a ticker', async () => {
      jest.spyOn(tickersService, 'create').mockResolvedValue(createInput);

      expect(await resolver.createTicker(createInput)).toEqual({
        name: 'TSL',
        fullName: 'Tesla',
      });
    });
  });

  describe('Update a ticker', () => {
    const createInput: CreateTickerInput = {
      name: 'TSL',
      fullName: 'Tesla',
    };

    it('Should be defined', async () => {
      jest.spyOn(tickersService, 'updateTicker').mockResolvedValue(createInput);

      expect(await resolver.updateTicker(createInput)).toBeDefined();
    });

    it('Should update a ticker', async () => {
      jest.spyOn(tickersService, 'updateTicker').mockResolvedValue(createInput);
      expect(await resolver.updateTicker(createInput)).toEqual(createInput);
    });
  });

  describe('Delete a ticker', () => {
    const Ticker = {
      name: 'TSL',
      fullName: 'Tesla',
    };

    it('Should be defined', async () => {
      jest.spyOn(tickersService, 'deleteTicker').mockResolvedValue(Ticker);

      expect(await resolver.deleteTicker(Ticker.name)).toBeDefined();
    });

    it('Should return deleted ticker', async () => {
      jest.spyOn(tickersService, 'deleteTicker').mockResolvedValue(Ticker);

      expect(await resolver.deleteTicker(Ticker.name)).toEqual(Ticker);
    });
  });

  describe('Get all tickers', () => {
    const Tickers: TickerModel[] = [
      {
        name: 'TSL',
        fullName: 'Tesla',
      },
      {
        name: 'BIDU',
        fullName: 'Baidu',
      },
    ];

    it('Should returns array of tickers', async () => {
      jest.spyOn(tickersService, 'findAll').mockResolvedValue(Tickers);

      expect(await resolver.findAll()).toBe(Tickers);
    });

    it('Should return array with length equal to 2', async () => {
      jest.spyOn(tickersService, 'findAll').mockResolvedValue(Tickers);

      expect((await resolver.findAll()).length).toEqual(2);
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
    const Ticker = {
      name: 'TSL',
      fullName: 'Tesla',
    };

    it('Should be defined', async () => {
      jest.spyOn(tickersService, 'findOne').mockResolvedValue(Ticker);

      expect(await resolver.findOne(Ticker.name)).toBeDefined();
    });

    it('Should return one specific ticker', async () => {
      jest.spyOn(tickersService, 'findOne').mockResolvedValue(Ticker);

      expect(await resolver.findOne(Ticker.name)).toEqual(Ticker);
    });
  });
});
