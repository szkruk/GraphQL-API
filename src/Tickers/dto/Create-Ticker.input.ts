import { InputType, Field } from '@nestjs/graphql';
import { IsAlpha, IsNotEmpty, IsUppercase, Length } from 'class-validator';

@InputType()
export class CreateTickerInput {
  @IsUppercase()
  @Length(2, 6)
  @IsAlpha()
  @Field()
  name: string;

  @IsNotEmpty()
  @IsAlpha()
  @Field()
  fullName: string;
}
