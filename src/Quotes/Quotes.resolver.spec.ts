import { Test, TestingModule } from '@nestjs/testing';
import { QuotesResolver } from './Quotes.resolver';
import { QuotesService } from './Quotes.service';
import { QuoteModel } from './model/Quote.model';
import { CreateQuoteInput } from './dto/Create-Quote.input';

describe('QuotesResolver', () => {
  let resolver: QuotesResolver;

  const Quotes: QuoteModel[] = [
    {
      name: 'TSL',
      timestamp: 1241,
      price: 1.23,
    },
    {
      name: 'TSL',
      timestamp: 1242,
      price: 1.23,
    },
    {
      name: 'INTC',
      timestamp: 1241,
      price: 1.24,
    },
  ];

  const mockQuoteService = {
    findAll: jest.fn(() => {
      return Promise.resolve(Quotes);
    }),

    findOne: jest.fn((name: string, timestamp: number) => {
      return Promise.resolve({
        name: name,
        timestamp: timestamp,
        price: expect.any(Number),
      });
    }),

    findAllByName: jest.fn((name: string) => {
      return Promise.resolve([
        {
          name: 'TSL',
          timestamp: 1241,
          price: 1.23,
        },
        {
          name: 'TSL',
          timestamp: 1242,
          price: 1.23,
        },
      ]);
    }),

    findAllByTimestamp: jest.fn(() => {
      return Promise.resolve([
        {
          name: 'TSL',
          timestamp: 1241,
          price: 1.23,
        },
        {
          name: 'INTC',
          timestamp: 1241,
          price: 1.24,
        },
      ]);
    }),

    createQuote: jest.fn((createQuoteInput: CreateQuoteInput) => {
      return Promise.resolve({
        ...createQuoteInput,
      });
    }),

    deleteQuote: jest.fn((name: string, timestamp: number) => {
      return Promise.resolve({
        name: name,
        timestamp: timestamp,
        price: expect.any(Number),
      });
    }),

    update: jest.fn((createQuoteInput: CreateQuoteInput) => {
      return Promise.resolve({
        ...createQuoteInput,
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuotesResolver, QuotesService],
    })
      .overrideProvider(QuotesService)
      .useValue(mockQuoteService)
      .compile();

    resolver = module.get<QuotesResolver>(QuotesResolver);
  });

  it('Should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('Get all quotes', () => {
    let Quotes: QuoteModel[];
    beforeAll(async () => {
      Quotes = await resolver.findAllQuotes();
    });

    it('Should return array of quotes', async () => {
      expect(Array.isArray(Quotes)).toBe(true);
    });

    it('Should return array with length equal to 3', async () => {
      expect(Quotes.length).toEqual(3);
    });

    it('Should return three quotes', async () => {
      expect(Quotes).toEqual([
        {
          name: 'TSL',
          timestamp: 1241,
          price: 1.23,
        },
        {
          name: 'TSL',
          timestamp: 1242,
          price: 1.23,
        },
        {
          name: 'INTC',
          timestamp: 1241,
          price: 1.24,
        },
      ]);
    });
  });

  describe('Get one Quote', () => {
    let Quote: QuoteModel;
    beforeAll(async () => {
      Quote = await resolver.findOneQuote('TSL', 1231);
    });

    it('Should be defined', () => {
      expect(Quote).toBeDefined();
    });

    it('Should return quote ', () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 1231,
        price: expect.any(Number),
      });
    });
  });

  describe('Get quotes by Name', () => {
    let Quotes: QuoteModel[];
    beforeAll(async () => {
      Quotes = await resolver.findAllQuotesByName('TSL');
    });

    it('Should return array', () => {
      expect(Array.isArray(Quotes));
    });

    it('Should return array with length equal to 2', async () => {
      expect(Quotes.length).toEqual(2);
    });

    it('Should return quotes with same name ', () => {
      expect(Quotes).toEqual([
        {
          name: 'TSL',
          timestamp: 1241,
          price: 1.23,
        },
        {
          name: 'TSL',
          timestamp: 1242,
          price: 1.23,
        },
      ]);
    });
  });

  describe('Get quotes by Timestamp', () => {
    let Quotes: QuoteModel[];
    beforeAll(async () => {
      Quotes = await resolver.findAllQuotesByTimestamp(1241);
    });

    it('Should return array', () => {
      expect(Array.isArray(Quotes));
    });

    it('Should return array with length equal to 2', async () => {
      expect(Quotes.length).toEqual(2);
    });

    it('Should return quotes with same timestamp ', () => {
      expect(Quotes).toEqual([
        {
          name: 'TSL',
          timestamp: 1241,
          price: 1.23,
        },
        {
          name: 'INTC',
          timestamp: 1241,
          price: 1.24,
        },
      ]);
    });
  });

  describe('Create quote', () => {
    let Quote: QuoteModel;
    beforeAll(async () => {
      Quote = await resolver.createQuote({
        name: 'TSL',
        timestamp: 123,
        price: 12.3,
      });
    });

    it('Should be defined', () => {
      expect(Quote).toBeDefined();
    });

    it('Should return created quote', () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 123,
        price: 12.3,
      });
    });
  });

  describe('Update quote', () => {
    let Quote: QuoteModel;
    beforeAll(async () => {
      Quote = await resolver.updateQuote({
        name: 'TSL',
        timestamp: 123,
        price: 12.3,
      });
    });

    it('Should be defined', () => {
      expect(Quote).toBeDefined();
    });

    it('Should return updated quote', () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 123,
        price: 12.3,
      });
    });
  });

  describe('Delete quote', () => {
    let Quote: QuoteModel;
    beforeAll(async () => {
      Quote = await resolver.deleteQuote('TSL', 123);
    });

    it('Should be defined', () => {
      expect(Quote).toBeDefined();
    });

    it('Should return deleted quote', () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 123,
        price: expect.any(Number),
      });
    });
  });
});
