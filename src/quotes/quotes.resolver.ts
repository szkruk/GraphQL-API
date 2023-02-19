import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateQuoteInput } from './dto/create-quote.input';
import { Quote } from './quote.entity';
import { QuotesService } from './quotes.service';

@Resolver(of => Quote)
export class QuotesResolver {
    constructor(private quotesService:QuotesService){}

    @Query(returns => [Quote])
    quotes():Promise<Quote[]>  {
        return this.quotesService.findAll();
    }

    @Mutation(returns => Quote)
    createQuote(@Args('createQuoteInput') createQuoteInput:CreateQuoteInput):Promise<Quote>{
        return this.quotesService.createQuote(createQuoteInput);
    }
    
}
