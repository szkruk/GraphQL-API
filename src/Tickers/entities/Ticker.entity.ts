import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('Ticker')
export class TickerEntity {
  @PrimaryColumn({ type: 'varchar', length: 6 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;
}
