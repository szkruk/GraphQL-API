import { TickerEntity } from 'src/tickers/entities/ticker.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('Quote')
export class QuoteEntity {
  @PrimaryColumn({ type: 'int' })
  timestamp: number;

  @Column({ type: 'numeric' })
  price: number;

  @PrimaryColumn({ type: 'varchar', length: 6 })
  @ManyToOne(() => TickerEntity, (ticker) => ticker.name, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'name' })
  name: string;
}
