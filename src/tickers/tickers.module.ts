import { Module } from '@nestjs/common';
import { TickersService } from './tickers.service';
import { TickersResolver } from './tickers.resolver';
import { Ticker } from './entities/ticker.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Ticker])],
  providers: [TickersResolver, TickersService],
})
export class TickersModule {}
