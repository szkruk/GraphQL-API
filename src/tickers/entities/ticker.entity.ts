import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Quote } from 'src/quotes/entities/quote.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('Ticker')
@ObjectType()
export class Ticker {
  @PrimaryColumn()
  @Field((type) => String)
  name: string;

  @Column()
  @Field((type) => String)
  fullName: string;
}
