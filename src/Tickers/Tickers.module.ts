import { Module } from '@nestjs/common';
import { TickersService } from './Tickers.service';
import { TickersResolver } from './Tickers.resolver';
import { TickerEntity } from './entities/Ticker.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteEntity } from '../Quotes/entities/Quote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TickerEntity, QuoteEntity])],
  providers: [TickersResolver, TickersService],
  exports: [TickersService],
})
export class TickersModule {}
