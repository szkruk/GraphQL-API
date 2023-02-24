import { Args, Mutation, Query, Int, Resolver } from '@nestjs/graphql';
import { CreateQuoteInput } from './dto/create-quote.input';

import { QuoteModel } from './model/quote.model';
import { QuotesService } from './quotes.service';

@Resolver((of) => QuoteModel)
export class QuotesResolver {
  constructor(private quotesService: QuotesService) {}

  @Query((returns) => [QuoteModel], { name: 'getQuotes' })
  async findAllQuotes(): Promise<QuoteModel[]> {
    return this.quotesService.findAll();
  }

  @Query((returns) => QuoteModel, { name: 'getQuote' })
  async findOneQuote(
    @Args('name', { type: () => String }) name: string,
    @Args('timestamp', { type: () => Int }) timestamp: number,
  ): Promise<QuoteModel> {
    return this.quotesService.findOne(name, timestamp);
  }

  @Query((returns) => [QuoteModel], { name: 'getQuotesByName' })
  async findAllQuotesByName(
    @Args('name', { type: () => String }) name: string,
  ): Promise<QuoteModel[]> {
    return this.quotesService.findAllByName(name);
  }

  @Query((returns) => [QuoteModel], { name: 'getQuotesByTimestamp' })
  async findAllQuotesByTimestamp(
    @Args('timestamp', { type: () => Int }) timestamp: number,
  ): Promise<QuoteModel[]> {
    return this.quotesService.findAllByTimestamp(timestamp);
  }

  @Mutation((returns) => QuoteModel, { name: 'createQuote' })
  async createQuote(
    @Args('newQuote') createQuoteInput: CreateQuoteInput,
  ): Promise<QuoteModel> {
    return this.quotesService.createQuote(createQuoteInput);
  }

  @Mutation((returns) => QuoteModel, { name: 'deleteQuote' })
  async deleteQuote(
    @Args('name', { type: () => String }) name: string,
    @Args('timestamp', { type: () => Int }) timestamp: number,
  ): Promise<QuoteModel> {
    return this.quotesService.deleteQuote(name, timestamp);
  }

  @Mutation((returns) => QuoteModel, { name: 'updateQuote' })
  async updateQuote(
    @Args('updateQuote') createQuoteInput: CreateQuoteInput,
  ): Promise<QuoteModel> {
    return this.quotesService.update(createQuoteInput);
  }
}
