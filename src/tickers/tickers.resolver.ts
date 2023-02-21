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
  ): Promise<TickerModel> {
    return await this.tickersService.create(createTickerInput);
  }

  @Mutation(() => TickerModel)
  async deleteTicker(@Args('name') name: string): Promise<TickerModel> {
    return await this.tickersService.deleteTicker(name);
  }

  @Mutation(() => TickerModel)
  async editTicker(
    @Args('createTickerInput') createTickerInput: CreateTickerInput,
  ): Promise<TickerModel> {
    return await this.tickersService.editTicker(createTickerInput);
  }

  @Query(() => [TickerModel], { name: 'tickers' })
  async findAll(): Promise<TickerModel[]> {
    return await this.tickersService.findAll();
  }

  @Query(() => TickerModel, { name: 'ticker' })
  async findOne(
    @Args('name', { type: () => String }) name: string,
  ): Promise<TickerModel> {
    return await this.tickersService.findOne(name);
  }
}
