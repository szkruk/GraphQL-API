import { Field, Float, InputType } from '@nestjs/graphql';
import { IsAlpha, IsInt, IsNotEmpty } from 'class-validator';
import { Int } from 'type-graphql';

@InputType()
export class CreateQuoteInput {
  @IsNotEmpty()
  @IsAlpha()
  @Field()
  name: string;

  @IsInt()
  @IsNotEmpty()
  @Field((type) => Int)
  timestamp: number;

  @IsNotEmpty()
  @Field((type) => Float)
  price: number;
}
