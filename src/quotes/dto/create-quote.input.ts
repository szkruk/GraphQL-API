import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsAlpha,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsUppercase,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Int } from 'type-graphql';

@InputType()
export class CreateQuoteInput {
  @IsUppercase()
  @Length(2, 6)
  @IsAlpha()
  @Field()
  name: string;

  @IsInt()
  @Min(1)
  @Max(Math.pow(10, 9))
  @Field((type) => Int)
  timestamp: number;

  @IsPositive()
  @Field((type) => Float)
  price: number;
}
