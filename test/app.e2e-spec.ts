import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { QuoteEntity } from '../src/quotes/entities/quote.entity';

describe('GraphQL AppResolver ', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function sendQuery(queryString: string) {
    return await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: queryString });
  }

  async function initDB() {
    const Tickers = await sendQuery('query{tickers{name}}');

    await Promise.all(
      Tickers.body.data.tickers.map(async (ticker) => {
        await sendQuery(`mutation{deleteTicker(name:"${ticker.name}"){name}}`);
      }),
    );

    await sendQuery(
      `mutation{createQuote(createQuoteInput:{name:"TSL" timestamp:${123} price:${13.4}}){name timestamp}}`,
    );

    await sendQuery(
      `mutation{createQuote(createQuoteInput:{name:"TSL" timestamp:${124} price:${13.5}}){name timestamp}}`,
    );

    await sendQuery(
      `mutation{createQuote(createQuoteInput:{name:"INTC" timestamp:${123} price:${23.4}}){name timestamp}}`,
    );
  }

  describe('get all quotes', () => {
    let Quotes;
    beforeAll(async () => {
      await initDB();

      Quotes = (await sendQuery('query{quotes{name timestamp price}}')).body
        .data.quotes;
    });

    it('should be defined', async () => {
      expect(Quotes).toBeDefined();
    });

    it('should return 3 quotes', async () => {
      expect(Quotes).toEqual([
        {
          name: 'TSL',
          timestamp: 123,
          price: 13.4,
        },
        {
          name: 'TSL',
          timestamp: 124,
          price: 13.5,
        },
        {
          name: 'INTC',
          timestamp: 123,
          price: 23.4,
        },
      ]);
    });
  });

  describe('find one Quote', () => {
    let Quote;

    beforeAll(async () => {
      await initDB();

      Quote = (
        await sendQuery(
          `query{quote(name:"TSL", timestamp:${124}){name timestamp price}}`,
        )
      ).body.data.quote;
    });

    it('should be defined', async () => {
      expect(Quote).toBeDefined();
    });

    it('should return choosen quote', async () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 124,
        price: 13.5,
      });
    });

    it('should return error', async () => {
      const QuoteError = (
        await sendQuery(
          `query{quote(name:"TSL", timestamp:${125}){name timestamp price}}`,
        )
      ).body.errors[0].message;

      expect(QuoteError).toBe('Value not founded');
    });
  });

  describe('find by Timestamp', () => {
    let Quotes;
    beforeAll(async () => {
      await initDB();

      Quotes = (
        await sendQuery(
          `query{quotesByTimestamp(timestamp:${123}){name timestamp price}}`,
        )
      ).body.data.quotesByTimestamp;
    });

    it('should be defined', async () => {
      expect(Quotes).toBeDefined();
    });

    it('should return two quote with same timestamp', async () => {
      expect(Quotes).toEqual([
        {
          name: 'TSL',
          timestamp: 123,
          price: 13.4,
        },
        {
          name: 'INTC',
          timestamp: 123,
          price: 23.4,
        },
      ]);
    });

    it('should return empty array', async () => {
      const QuotesEmpty = (
        await sendQuery(
          `query{quotesByTimestamp(timestamp:${122}){name timestamp price}}`,
        )
      ).body.data.quotesByTimestamp;

      expect(QuotesEmpty).toEqual([]);
    });
  });

  describe('find by Name', () => {
    let Quotes;
    beforeAll(async () => {
      await initDB();

      Quotes = (
        await sendQuery(`query{quotesByName(name:"TSL"){name timestamp price}}`)
      ).body.data.quotesByName;
    });

    it('should be defined', async () => {
      expect(Quotes).toBeDefined();
    });

    it('should return two quotes with same name', async () => {
      expect(Quotes).toEqual([
        {
          name: 'TSL',
          timestamp: 123,
          price: 13.4,
        },
        {
          name: 'TSL',
          timestamp: 124,
          price: 13.5,
        },
      ]);
    });

    it('should return empty array', async () => {
      const QuotesEmpty = (
        await sendQuery(
          `query{quotesByName(name:"TSLA"){name timestamp price}}`,
        )
      ).body.data.quotesByName;

      expect(QuotesEmpty).toEqual([]);
    });
  });

  describe('create a quote', () => {
    let Quote;
    beforeAll(async () => {
      await initDB();

      Quote = (
        await sendQuery(
          `mutation{createQuote(createQuoteInput:{name:"TSLA" timestamp:${123} price:${13.4}}){name timestamp price}}`,
        )
      ).body.data.createQuote;
    });

    it('should be defined', async () => {
      expect(Quote).toBeDefined();
    });

    it('should return created Quote', async () => {
      expect(Quote).toEqual({
        name: 'TSLA',
        timestamp: 123,
        price: 13.4,
      });
    });

    it('should return error', async () => {
      const QuoteError = (
        await sendQuery(
          `mutation{createQuote(createQuoteInput:{name:"TSLA" timestamp:${123} price:${13.4}}){name timestamp price}}`,
        )
      ).body.errors[0].message;

      expect(QuoteError).toEqual('Qoute already exists');
    });
  });

  describe('update quote', () => {
    let Quote;
    beforeAll(async () => {
      await initDB();

      Quote = (
        await sendQuery(
          `mutation{updateQuote(createQuoteInput:{name:"TSL" timestamp:${123} price:${17.4}}){name timestamp price}}`,
        )
      ).body.data.updateQuote;
    });

    it('should be defined', async () => {
      expect(Quote).toBeDefined();
    });

    it('should return updated Quote', async () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 123,
        price: 17.4,
      });
    });

    it('should return error', async () => {
      const QuoteError = (
        await sendQuery(
          `mutation{updateQuote(createQuoteInput:{name:"TSLA" timestamp:${123} price:${17.4}}){name timestamp price}}`,
        )
      ).body.errors[0].message;

      expect(QuoteError).toEqual("Quote doesn't exists");
    });
  });

  describe('delete quote', () => {
    let Quote;
    beforeAll(async () => {
      await initDB();

      Quote = (
        await sendQuery(
          `mutation{deleteQuote(name:"TSL" timestamp:${123}){name timestamp price}}`,
        )
      ).body.data.deleteQuote;
    });

    it('should be defined', async () => {
      expect(Quote).toBeDefined();
    });

    it('should return deleted Quote', async () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 123,
        price: 13.4,
      });
    });

    it('should return error', async () => {
      const QuoteError = (
        await sendQuery(
          `mutation{deleteQuote(name:"TSLA" timestamp:${123}){name timestamp price}}`,
        )
      ).body.errors[0].message;

      expect(QuoteError).toEqual("Quote doesn't exists");
    });
  });

  describe('create a Ticker', () => {
    let Ticker;

    beforeAll(async () => {
      await initDB();

      Ticker = (
        await sendQuery(
          `mutation{createTicker(createTickerInput:{name:"TSLA" fullName:"Teslaa"}){name fullName}}`,
        )
      ).body.data.createTicker;
    });

    it('should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('should return created Ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSLA',
        fullName: 'Teslaa',
      });
    });

    it('should return error', async () => {
      const TickerError = (
        await sendQuery(
          `mutation{createTicker(createTickerInput:{name:"TSL" fullName:"Teslaa"}){name fullName}}`,
        )
      ).body.errors[0].message;

      expect(TickerError).toEqual('Ticker already exists');
    });
  });

  describe('get all tickers', () => {
    let Tickers;

    beforeAll(async () => {
      await initDB();

      Tickers = (await sendQuery(`query{tickers{name fullName}}`)).body.data
        .tickers;
    });

    it('should be defined', async () => {
      expect(Tickers).toBeDefined();
    });

    it('should return all Tickers', async () => {
      expect(Tickers).toEqual([
        {
          name: 'TSL',
          fullName: 'unknown',
        },
        {
          name: 'INTC',
          fullName: 'unknown',
        },
      ]);
    });
  });

  describe('get one ticker', () => {
    let Ticker;

    beforeAll(async () => {
      await initDB();

      Ticker = (await sendQuery(`query{ticker(name:"TSL"){name fullName}}`))
        .body.data.ticker;
    });

    it('should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('should return choosen ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'unknown',
      });
    });

    it('should return error', async () => {
      const TickerError = (
        await sendQuery(`query{ticker(name:"TSLAA"){name fullName}}`)
      ).body.errors[0].message;

      expect(TickerError).toEqual('Ticker not found');
    });
  });

  describe('delete ticker', () => {
    let Ticker;

    beforeAll(async () => {
      await initDB();

      Ticker = (
        await sendQuery(`mutation{deleteTicker(name:"TSL"){name fullName}}`)
      ).body.data.deleteTicker;
    });

    it('should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('should return deleted ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'unknown',
      });
    });

    it('should return error', async () => {
      const TickerError = (
        await sendQuery(`mutation{deleteTicker(name:"TSLAA"){name fullName}}`)
      ).body.errors[0].message;

      expect(TickerError).toEqual('Value not founded');
    });
  });

  describe('update ticker', () => {
    let Ticker;

    beforeAll(async () => {
      await initDB();

      Ticker = (
        await sendQuery(
          `mutation{updateTicker(createTickerInput:{name:"TSL" fullName:"Teslaa"}){name fullName}}`,
        )
      ).body.data.updateTicker;
    });

    it('should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('should return updated ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'Teslaa',
      });
    });

    it('should return error', async () => {
      const TickerError = (
        await sendQuery(
          `mutation{updateTicker(createTickerInput:{name:"TSLA" fullName:"Teslaa"}){name fullName}}`,
        )
      ).body.errors[0].message;

      expect(TickerError).toEqual('There is no ticker like this');
    });
  });
});
