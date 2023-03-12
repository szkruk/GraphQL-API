import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

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
    const Tickers = await sendQuery('query{getTickers{name}}');

    await Promise.all(
      Tickers.body.data.getTickers.map(async (ticker) => {
        await sendQuery(`mutation{deleteTicker(name:"${ticker.name}"){name}}`);
      }),
    );

    await sendQuery(
      `mutation{createQuote(newQuote:{name:"TSL" timestamp:${123} price:${13.4}}){name timestamp}}`,
    );

    await sendQuery(
      `mutation{createQuote(newQuote:{name:"TSL" timestamp:${124} price:${13.5}}){name timestamp}}`,
    );

    await sendQuery(
      `mutation{createQuote(newQuote:{name:"INTC" timestamp:${123} price:${23.4}}){name timestamp}}`,
    );
  }

  describe('Get all quotes', () => {
    let Quotes;
    beforeAll(async () => {
      await initDB();

      Quotes = (await sendQuery('query{getQuotes{name timestamp price}}')).body
        .data.getQuotes;
    });

    it('Should be defined', async () => {
      expect(Quotes).toBeDefined();
    });

    it('Should return 3 quotes', async () => {
      expect(Quotes).toEqual(
        expect.arrayContaining([
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
        ]),
      );
    });
  });

  describe('Get one quote', () => {
    let Quote;

    beforeAll(async () => {
      await initDB();

      Quote = (
        await sendQuery(
          `query{getQuote(name:"TSL", timestamp:${124}){name timestamp price}}`,
        )
      ).body.data.getQuote;
    });

    it('Should be defined', async () => {
      expect(Quote).toBeDefined();
    });

    it('Should return choosen quote', async () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 124,
        price: 13.5,
      });
    });

    it('Should return error', async () => {
      const QuoteError = (
        await sendQuery(
          `query{getQuote(name:"TSL", timestamp:${125}){name timestamp price}}`,
        )
      ).body.errors[0].message;

      expect(QuoteError).toBe('Value not founded');
    });
  });

  describe('Get quotes by timestamp', () => {
    let Quotes;
    beforeAll(async () => {
      await initDB();

      Quotes = (
        await sendQuery(
          `query{getQuotesByTimestamp(timestamp:${123}){name timestamp price}}`,
        )
      ).body.data.getQuotesByTimestamp;
    });

    it('Should be defined', async () => {
      expect(Quotes).toBeDefined();
    });

    it('Should return two quotes with same timestamp', async () => {
      expect(Quotes).toEqual(
        expect.arrayContaining([
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
        ]),
      );
    });

    it('Should return error', async () => {
      const QuotesEmpty = (
        await sendQuery(
          `query{getQuotesByTimestamp(timestamp:${12222}){name timestamp price}}`,
        )
      ).body.errors[0].message;

      expect(QuotesEmpty).toBe('No records for this timestamp');
    });
  });

  describe('Get quotes by name', () => {
    let Quotes;
    beforeAll(async () => {
      await initDB();

      Quotes = (
        await sendQuery(
          `query{getQuotesByName(name:"TSL"){name timestamp price}}`,
        )
      ).body.data.getQuotesByName;

      (
        await sendQuery(
          `mutation{createTicker(newTicker:{name:"ZZZ" fullName:"Zzzzzz"}){name fullName}}`,
        )
      ).body.data.createTicker;
    });

    it('Should be defined', async () => {
      expect(Quotes).toBeDefined();
    });

    it('Should return two quotes with same name', async () => {
      expect(Quotes).toEqual(
        expect.arrayContaining([
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
        ]),
      );
    });

    it('Should return empty array', async () => {
      const QuotesEmpty = (
        await sendQuery(
          `query{getQuotesByName(name:"ZZZ"){name timestamp price}}`,
        )
      ).body.data.getQuotesByName;

      expect(QuotesEmpty).toEqual([]);
    });

    it('Should return error', async () => {
      const QuotesEmpty = (
        await sendQuery(
          `query{getQuotesByName(name:"TSLAAA"){name timestamp price}}`,
        )
      ).body.errors[0].message;

      expect(QuotesEmpty).toBe('There is no ticker with this name');
    });
  });

  describe('Create a quote', () => {
    let Quote;
    beforeAll(async () => {
      await initDB();

      Quote = (
        await sendQuery(
          `mutation{createQuote(newQuote:{name:"TSLA" timestamp:${123} price:${13.4}}){name timestamp price}}`,
        )
      ).body.data.createQuote;
    });

    it('Should be defined', async () => {
      expect(Quote).toBeDefined();
    });

    it('Should return created quote', async () => {
      expect(Quote).toEqual({
        name: 'TSLA',
        timestamp: 123,
        price: 13.4,
      });
    });

    it('Should return error', async () => {
      const QuoteError = (
        await sendQuery(
          `mutation{createQuote(newQuote:{name:"TSLA" timestamp:${123} price:${13.4}}){name timestamp price}}`,
        )
      ).body.errors[0].message;

      expect(QuoteError).toEqual('Qoute already exists');
    });
  });

  describe('Update quote', () => {
    let Quote;
    beforeAll(async () => {
      await initDB();

      Quote = (
        await sendQuery(
          `mutation{updateQuote(updateQuote:{name:"TSL" timestamp:${123} price:${17.4}}){name timestamp price}}`,
        )
      ).body.data.updateQuote;
    });

    it('Should be defined', async () => {
      expect(Quote).toBeDefined();
    });

    it('Should return updated quote', async () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 123,
        price: 17.4,
      });
    });

    it('Should return error', async () => {
      const QuoteError = (
        await sendQuery(
          `mutation{updateQuote(updateQuote:{name:"TSLA" timestamp:${123} price:${17.4}}){name timestamp price}}`,
        )
      ).body.errors[0].message;

      expect(QuoteError).toEqual("Quote doesn't exists");
    });
  });

  describe('Delete quote', () => {
    let Quote;
    beforeAll(async () => {
      await initDB();

      Quote = (
        await sendQuery(
          `mutation{deleteQuote(name:"TSL" timestamp:${123}){name timestamp price}}`,
        )
      ).body.data.deleteQuote;
    });

    it('Should be defined', async () => {
      expect(Quote).toBeDefined();
    });

    it('Should return deleted Quote', async () => {
      expect(Quote).toEqual({
        name: 'TSL',
        timestamp: 123,
        price: 13.4,
      });
    });

    it('Should return error', async () => {
      const QuoteError = (
        await sendQuery(
          `mutation{deleteQuote(name:"TSLA" timestamp:${123}){name timestamp price}}`,
        )
      ).body.errors[0].message;

      expect(QuoteError).toEqual("Quote doesn't exists");
    });
  });

  describe('Create a Ticker', () => {
    let Ticker;

    beforeAll(async () => {
      await initDB();

      Ticker = (
        await sendQuery(
          `mutation{createTicker(newTicker:{name:"TSLA" fullName:"Teslaa"}){name fullName}}`,
        )
      ).body.data.createTicker;
    });

    it('Should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('Should return created Ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSLA',
        fullName: 'Teslaa',
      });
    });

    it('Should return error', async () => {
      const TickerError = (
        await sendQuery(
          `mutation{createTicker(newTicker:{name:"TSL" fullName:"Teslaa"}){name fullName}}`,
        )
      ).body.errors[0].message;

      expect(TickerError).toEqual('Ticker already exists');
    });
  });

  describe('Get all tickers', () => {
    let Tickers;

    beforeAll(async () => {
      await initDB();

      Tickers = (await sendQuery(`query{getTickers{name fullName}}`)).body.data
        .getTickers;
    });

    it('Should be defined', async () => {
      expect(Tickers).toBeDefined();
    });

    it('Should return all tickers', async () => {
      expect(Tickers).toEqual(
        expect.arrayContaining([
          {
            name: 'TSL',
            fullName: 'unknown',
          },
          {
            name: 'INTC',
            fullName: 'unknown',
          },
        ]),
      );
    });
  });

  describe('Get ticker', () => {
    let Ticker;

    beforeAll(async () => {
      await initDB();

      Ticker = (await sendQuery(`query{getTicker(name:"TSL"){name fullName}}`))
        .body.data.getTicker;
    });

    it('Should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('Should return choosen ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'unknown',
      });
    });

    it('Should return error', async () => {
      const TickerError = (
        await sendQuery(`query{getTicker(name:"TSLAA"){name fullName}}`)
      ).body.errors[0].message;

      expect(TickerError).toEqual('Ticker not found');
    });
  });

  describe('Delete ticker', () => {
    let Ticker;

    beforeAll(async () => {
      await initDB();

      Ticker = (
        await sendQuery(`mutation{deleteTicker(name:"TSL"){name fullName}}`)
      ).body.data.deleteTicker;
    });

    it('Should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('Should return deleted ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'unknown',
      });
    });

    it('Should return error', async () => {
      const TickerError = (
        await sendQuery(`mutation{deleteTicker(name:"TSLAA"){name fullName}}`)
      ).body.errors[0].message;

      expect(TickerError).toEqual('Value not founded');
    });
  });

  describe('Update ticker', () => {
    let Ticker;

    beforeAll(async () => {
      await initDB();

      Ticker = (
        await sendQuery(
          `mutation{updateTicker(updateTicker:{name:"TSL" fullName:"Teslaa"}){name fullName}}`,
        )
      ).body.data.updateTicker;
    });

    it('Should be defined', async () => {
      expect(Ticker).toBeDefined();
    });

    it('Should return updated ticker', async () => {
      expect(Ticker).toEqual({
        name: 'TSL',
        fullName: 'Teslaa',
      });
    });

    it('Should return error', async () => {
      const TickerError = (
        await sendQuery(
          `mutation{updateTicker(updateTicker:{name:"TSLA" fullName:"Teslaa"}){name fullName}}`,
        )
      ).body.errors[0].message;

      expect(TickerError).toEqual('There is no ticker like this');
    });
  });
});
