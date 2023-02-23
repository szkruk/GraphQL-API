import { Test, TestingModule } from '@nestjs/testing';
import { QuotesResolver } from './quotes.resolver';
import { QuotesService } from './quotes.service';
import { QuoteModel } from './model/quote.model';
import { CreateQuoteInput } from './dto/create-quote.input';

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

    findAllByTimeStamp: jest.fn(() => {
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

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('get all Quotes', () => {
    let Quotes: QuoteModel[];
    beforeAll(async () => {
      Quotes = await resolver.findAllQuotes();
    });

    it('should returns array of Quotes', async () => {
      expect(Array.isArray(Quotes)).toBe(true);
    });

    it('should return array with length equal to 3', async () => {
      expect(Quotes.length).toEqual(3);
    });

    it('should return three quotes', async () => {
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

  describe('get one Quote', () => {
    let Quote: QuoteModel;
    beforeAll(async () => {
      Quote = await resolver.findOneQuote('TSL', 1231);
    });

    it('should return QuoteModel', () => {
      expect(Quote).toBeDefined();
    });

    it('should return quote ', () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 1231,
        price: expect.any(Number),
      });
    });
  });

  describe('get quotes by Name', () => {
    let Quotes: QuoteModel[];
    beforeAll(async () => {
      Quotes = await resolver.findAllQuotesByName('TSL');
    });

    it('should return QuoteModel', () => {
      expect(Array.isArray(Quotes));
    });

    it('should return array with length equal to 2', async () => {
      expect(Quotes.length).toEqual(2);
    });

    it('should return quotes with same name ', () => {
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

  describe('get quotes by Timestamp', () => {
    let Quotes: QuoteModel[];
    beforeAll(async () => {
      Quotes = await resolver.findAllQuotesByTimestamp(1241);
    });

    it('should return QuoteModel', () => {
      expect(Array.isArray(Quotes));
    });

    it('should return array with length equal to 2', async () => {
      expect(Quotes.length).toEqual(2);
    });

    it('should return quotes with same timestamp ', () => {
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

  describe('creating quote', () => {
    let Quote: QuoteModel;
    beforeAll(async () => {
      Quote = await resolver.createQuote({
        name: 'TSL',
        timestamp: 123,
        price: 12.3,
      });
    });

    it('should return QuoteModel', () => {
      expect(Quote).toBeDefined();
    });

    it('should return created quote', () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 123,
        price: 12.3,
      });
    });
  });

  describe('updating quote', () => {
    let Quote: QuoteModel;
    beforeAll(async () => {
      Quote = await resolver.updateQuote({
        name: 'TSL',
        timestamp: 123,
        price: 12.3,
      });
    });

    it('should return QuoteModel', () => {
      expect(Quote).toBeDefined();
    });

    it('should return updated quote', () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 123,
        price: 12.3,
      });
    });
  });

  describe('deleting quote', () => {
    let Quote: QuoteModel;
    beforeAll(async () => {
      Quote = await resolver.deleteQuote('TSL', 123);
    });

    it('should return QuoteModel', () => {
      expect(Quote).toBeDefined();
    });

    it('should return deleted quote', () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 123,
        price: expect.any(Number),
      });
    });
  });
});
