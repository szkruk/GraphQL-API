import { Test, TestingModule } from '@nestjs/testing';
import { QuotesResolver } from './Quotes.resolver';
import { QuotesService } from './Quotes.service';
import { QuoteModel } from './model/Quote.model';
import { CreateQuoteInput } from './dto/Create-Quote.input';

describe('QuotesResolver', () => {
  let resolver: QuotesResolver;
  let quotesService: QuotesService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesResolver,
        {
          provide: QuotesService,
          useValue: {
            findAll: jest.fn(),
            findAllByName: jest.fn(),
            findOne: jest.fn(),
            findAllByTimestamp: jest.fn(),
            createQuote: jest.fn(),
            deleteQuote: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<QuotesResolver>(QuotesResolver);
    quotesService = module.get<QuotesService>(QuotesService);
  });

  it('Should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('Should be defined', () => {
    expect(quotesService).toBeDefined();
  });

  describe('Get all quotes', () => {
    it('Should return array of quotes', async () => {
      jest.spyOn(quotesService, 'findAll').mockResolvedValue(Quotes);

      const quotes = await resolver.findAllQuotes();
      expect(Array.isArray(quotes)).toBe(true);
    });

    it('Should return array with length equal to 3', async () => {
      jest.spyOn(quotesService, 'findAll').mockResolvedValue(Quotes);
      expect((await resolver.findAllQuotes()).length).toEqual(3);
    });

    it('Should return three quotes', async () => {
      jest.spyOn(quotesService, 'findAll').mockResolvedValue(Quotes);

      expect(await resolver.findAllQuotes()).toEqual(Quotes);
    });
  });

  describe('Get one Quote', () => {
    const Quote = {
      name: 'TSL',
      timestamp: 1242,
      price: 1.23,
    };

    it('Should be defined', async () => {
      jest.spyOn(quotesService, 'findOne').mockResolvedValue(Quote);

      expect(
        await resolver.findOneQuote(Quote.name, Quote.timestamp),
      ).toBeDefined();
    });

    it('Should return quote ', async () => {
      jest.spyOn(quotesService, 'findOne').mockResolvedValue(Quote);

      expect(await resolver.findOneQuote(Quote.name, Quote.timestamp)).toEqual(
        Quote,
      );
    });
  });

  describe('Get quotes by Name', () => {
    const QuotesByName: QuoteModel[] = [
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
    ];

    it('Should return array', async () => {
      jest
        .spyOn(quotesService, 'findAllByName')
        .mockResolvedValue(QuotesByName);

      const quotes = await resolver.findAllQuotesByName('TSL');
      expect(Array.isArray(quotes)).toBe(true);
    });

    it('Should return array with length equal to 2', async () => {
      jest
        .spyOn(quotesService, 'findAllByName')
        .mockResolvedValue(QuotesByName);

      expect((await resolver.findAllQuotesByName('TSL')).length).toEqual(2);
    });

    it('Should return quotes with same name ', async () => {
      jest
        .spyOn(quotesService, 'findAllByName')
        .mockResolvedValue(QuotesByName);

      expect(await resolver.findAllQuotesByName('TSL')).toEqual(QuotesByName);
    });
  });

  describe('Get quotes by Timestamp', () => {
    const QuotesByTimeStamp: QuoteModel[] = [
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
    ];

    it('Should return array', async () => {
      jest
        .spyOn(quotesService, 'findAllByTimestamp')
        .mockResolvedValue(QuotesByTimeStamp);

      const quotes = await resolver.findAllQuotesByTimestamp(1241);
      expect(Array.isArray(quotes)).toBe(true);
    });

    it('Should return array with length equal to 2', async () => {
      jest
        .spyOn(quotesService, 'findAllByTimestamp')
        .mockResolvedValue(QuotesByTimeStamp);

      expect((await resolver.findAllQuotesByTimestamp(1241)).length).toEqual(2);
    });

    it('Should return quotes with same timestamp ', async () => {
      jest
        .spyOn(quotesService, 'findAllByTimestamp')
        .mockResolvedValue(QuotesByTimeStamp);

      expect(await resolver.findAllQuotesByTimestamp(1241)).toEqual(
        QuotesByTimeStamp,
      );
    });
  });

  describe('Create quote', () => {
    const CreatedQuote = {
      name: 'TSL',
      timestamp: 123,
      price: 12.3,
    };

    it('Should be defined', async () => {
      jest.spyOn(quotesService, 'createQuote').mockResolvedValue(CreatedQuote);

      expect(await resolver.createQuote(CreatedQuote)).toBeDefined();
    });

    it('Should return created quote', async () => {
      jest.spyOn(quotesService, 'createQuote').mockResolvedValue(CreatedQuote);

      expect(await resolver.createQuote(CreatedQuote)).toEqual(CreatedQuote);
    });
  });

  describe('Update quote', () => {
    const UpdatedQuote = {
      name: 'TSL',
      timestamp: 123,
      price: 12.3,
    };

    it('Should be defined', async () => {
      jest.spyOn(quotesService, 'update').mockResolvedValue(UpdatedQuote);

      expect(await resolver.updateQuote(UpdatedQuote)).toBeDefined();
    });

    it('Should return updated quote', async () => {
      jest.spyOn(quotesService, 'update').mockResolvedValue(UpdatedQuote);

      expect(await resolver.updateQuote(UpdatedQuote)).toEqual(UpdatedQuote);
    });
  });

  describe('Delete quote', () => {
    const DeletedQuote = {
      name: 'TSL',
      timestamp: 123,
      price: 12.3,
    };

    it('Should be defined', async () => {
      jest.spyOn(quotesService, 'deleteQuote').mockResolvedValue(DeletedQuote);

      expect(
        await resolver.deleteQuote(DeletedQuote.name, DeletedQuote.timestamp),
      ).toBeDefined();
    });

    it('Should return deleted quote', async () => {
      jest.spyOn(quotesService, 'deleteQuote').mockResolvedValue(DeletedQuote);

      expect(
        await resolver.deleteQuote(DeletedQuote.name, DeletedQuote.timestamp),
      ).toEqual(DeletedQuote);
    });
  });
});
