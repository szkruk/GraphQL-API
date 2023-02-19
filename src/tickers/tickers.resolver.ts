import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TickersService } from './tickers.service';
import { Ticker } from './entities/ticker.entity';
import { CreateTickerInput } from './dto/create-ticker.input';
import { UpdateTickerInput } from './dto/update-ticker.input';

@Resolver((of) => Ticker)
export class TickersResolver {
  constructor(private readonly tickersService: TickersService) {}

  @Mutation(() => Ticker)
  createTicker(
    @Args('createTickerInput') createTickerInput: CreateTickerInput,
  ) {
    return this.tickersService.create(createTickerInput);
  }

  @Query(() => [Ticker], { name: 'tickers' })
  findAll() {
    return this.tickersService.findAll();
  }

  // @Query(() => Ticker, { name: 'ticker' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.tickersService.findOne(id);
  // }

  // @Mutation(() => Ticker)
  // updateTicker(@Args('updateTickerInput') updateTickerInput: UpdateTickerInput) {
  //   return this.tickersService.update(updateTickerInput.id, updateTickerInput);
  // }

  // @Mutation(() => Ticker)
  // removeTicker(@Args('id', { type: () => Int }) id: number) {
  //   return this.tickersService.remove(id);
  // }
}
