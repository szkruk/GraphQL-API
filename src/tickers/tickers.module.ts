import { Module } from '@nestjs/common';
import { TickersService } from './tickers.service';
import { TickersResolver } from './tickers.resolver';
import { TickerEntity } from './entities/ticker.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteEntity } from '../quotes/entities/quote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TickerEntity, QuoteEntity])],
  providers: [TickersResolver, TickersService],
  exports: [TickersService],
})
export class TickersModule {}
