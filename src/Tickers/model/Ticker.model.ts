import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType({ description: 'Ticker Model' })
export class TickerModel {
  @Field((type) => String)
  name: string;

  @Field((type) => String)
  fullName: string;
}
