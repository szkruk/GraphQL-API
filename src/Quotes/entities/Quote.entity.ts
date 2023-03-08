import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { TickerEntity } from '../../Tickers/entities/Ticker.entity';

@Entity('Quote')
export class QuoteEntity {
  @PrimaryColumn({ type: 'int' })
  timestamp: number;

  @Column({ type: 'float' })
  price: number;

  @PrimaryColumn({ type: 'varchar', length: 6 })
  @ManyToOne(() => TickerEntity, (ticker) => ticker.name, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'name' })
  name: string;
}
