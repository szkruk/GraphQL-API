import { Module } from '@nestjs/common';
import { TickersService } from './tickers.service';
import { TickersResolver } from './tickers.resolver';
import { TickerEntity } from './entities/ticker.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TickerEntity])],
  providers: [TickersResolver, TickersService],
  exports: [TickersService],
})
export class TickersModule {}
