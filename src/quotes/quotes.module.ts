import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesResolver } from './quotes.resolver';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { QuoteEntity } from './entities/quote.entity';
import { TickersModule } from '../tickers/tickers.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuoteEntity]), TickersModule],
  providers: [QuotesService, QuotesResolver],
})
export class QuotesModule {}
