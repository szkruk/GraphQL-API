import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TickersService } from './tickers.service';
import { TickerEntity } from './entities/ticker.entity';
import { CreateTickerInput } from './dto/create-ticker.input';
import { TickerModel } from './model/ticker.model';

@Resolver((of) => TickerModel)
export class TickersResolver {
  constructor(private readonly tickersService: TickersService) {}

  @Mutation(() => TickerModel)
  async createTicker(
    @Args('createTickerInput') createTickerInput: CreateTickerInput,
  ) {
    return this.tickersService.create(createTickerInput);
  }

  @Query(() => [TickerModel], { name: 'tickers' })
  async findAll() {
    return this.tickersService.findAll();
  }

  @Query(() => TickerModel, { name: 'ticker' })
  async findOne(
    @Args('name', { type: () => String }) name: string,
  ): Promise<TickerModel> {
    return this.tickersService.findOne(name);
  }
}
