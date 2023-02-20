import { Field, Float, InputType, Int } from '@nestjs/graphql';
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
