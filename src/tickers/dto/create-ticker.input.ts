import { InputType, Int, Field } from '@nestjs/graphql';
import { IsAlpha, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateTickerInput {
  @IsNotEmpty()
  @IsAlpha()
  @Field()
  name: string;

  @IsNotEmpty()
  @IsAlpha()
  @Field()
  fullName: string;
}
