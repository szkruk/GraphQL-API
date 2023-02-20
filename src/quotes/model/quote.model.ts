import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType({ description: 'Quote Model' })
export class QuoteModel {
  @Field((type) => String)
  name: string;

  @Field((type) => Int)
  timestamp: number;

  @Field((type) => Float)
  price: number;
}
