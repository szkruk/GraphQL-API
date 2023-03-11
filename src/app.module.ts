import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { QuotesModule } from './Quotes/Quotes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TickersModule } from './Tickers/Tickers.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuoteEntity } from './Quotes/entities/Quote.entity';
import { TickerEntity } from './Tickers/entities/Ticker.entity';
import { DataSourceManager } from './common/DataSourceManager';
import { DataSource } from 'typeorm';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'env/.env',
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: +configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_NAME'),
        entities: [QuoteEntity, TickerEntity],
        synchronize: true,
      }),
    }),

    QuotesModule,

    TickersModule,

    DataSourceManager,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
