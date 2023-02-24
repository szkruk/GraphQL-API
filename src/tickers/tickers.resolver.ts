import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TickersService } from './tickers.service';
import { CreateTickerInput } from './dto/create-ticker.input';
import { TickerModel } from './model/ticker.model';

@Resolver((of) => TickerModel)
export class TickersResolver {
  constructor(private readonly tickersService: TickersService) {}

  @Mutation(() => TickerModel, { name: 'createTicker' })
  async createTicker(
    @Args('newTicker') createTickerInput: CreateTickerInput,
  ): Promise<TickerModel> {
    return await this.tickersService.create(createTickerInput);
  }

  @Mutation(() => TickerModel, { name: 'deleteTicker' })
  async deleteTicker(@Args('name') name: string): Promise<TickerModel> {
    return await this.tickersService.deleteTicker(name);
  }

  @Mutation(() => TickerModel, { name: 'updateTicker' })
  async updateTicker(
    @Args('updateTicker') createTickerInput: CreateTickerInput,
  ): Promise<TickerModel> {
    return await this.tickersService.updateTicker(createTickerInput);
  }

  @Query(() => [TickerModel], { name: 'getTickers' })
  async findAll(): Promise<TickerModel[]> {
    return await this.tickersService.findAll();
  }

  @Query(() => TickerModel, { name: 'getTicker' })
  async findOne(
    @Args('name', { type: () => String }) name: string,
  ): Promise<TickerModel> {
    return await this.tickersService.findOne(name);
  }
}
