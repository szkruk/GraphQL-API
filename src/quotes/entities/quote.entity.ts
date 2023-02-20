import { TickerEntity } from 'src/tickers/entities/ticker.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('Quote')
export class QuoteEntity {
  @PrimaryColumn()
  timestamp: number;

  @Column()
  price: number;

  @PrimaryColumn()
  @ManyToOne(() => TickerEntity, (ticker) => ticker.name)
  @JoinColumn({ name: 'name' })
  name: string;
}
