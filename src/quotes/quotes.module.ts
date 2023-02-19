import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesResolver } from './quotes.resolver';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { Quote } from './entities/quote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quote])],
  providers: [QuotesService, QuotesResolver],
})
export class QuotesModule {}
