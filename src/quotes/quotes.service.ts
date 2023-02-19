import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common';
import { Repository } from 'typeorm/repository/Repository';
import { CreateQuoteInput } from './dto/create-quote.input';
import { Quote } from './quote.entity';

@Injectable()
export class QuotesService {
    constructor(@InjectRepository(Quote) private quotesRepository:Repository<Quote>){}
    async findAll():Promise<Quote[]>{
        return this.quotesRepository.find( )
    }


    async createQuote(createQuoteInput:CreateQuoteInput):Promise<Quote>{
        const newQuote = this.quotesRepository.create(createQuoteInput);
        return this.quotesRepository.save(newQuote)
    }
}
