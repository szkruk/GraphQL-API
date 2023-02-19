import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { IsAlpha, IsString } from 'class-validator';
import { Ticker } from 'src/tickers/entities/ticker.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('Quote')
@ObjectType()
export class Quote {
  // @PrimaryColumn()
  // @Field((type) => String)
  // name: string;

  @PrimaryColumn()
  @Field((type) => Int)
  timestamp: number;

  @Column()
  @Field((type) => Float)
  price: number;

  @PrimaryColumn()
  @Field((type) => String)
  @ManyToOne(() => Ticker, (ticker) => ticker.name)
  @JoinColumn({ name: 'name' })
  name: string;
}
