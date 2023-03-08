import { Module } from '@nestjs/common';
import { QuotesService } from './Quotes.service';
import { QuotesResolver } from './Quotes.resolver';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { QuoteEntity } from './entities/Quote.entity';
import { TickersModule } from '../Tickers/Tickers.module';
import { TickerEntity } from '../Tickers/entities/Ticker.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuoteEntity, TickerEntity]),
    TickersModule,
  ],
  providers: [QuotesService, QuotesResolver],
})
export class QuotesModule {}
