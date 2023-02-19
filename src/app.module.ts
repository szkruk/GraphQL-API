import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo'
import { join } from 'path';
import { QuotesModule } from './quotes/quotes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>(
      {
        driver:ApolloDriver,
        autoSchemaFile:join(process.cwd(),'src/schema.gql'),
        playground:true
      }
    ),
      TypeOrmModule.forRoot({
        type:'postgres',
        host:"localhost",
        port:5432,
        username:"postgres",
        password:"postgres",
        database:"mydb",
        entities:["**/*.entity{.ts,.js}"],
        synchronize:true,
      }),

      QuotesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
