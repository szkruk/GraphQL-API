import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('Ticker')
export class TickerEntity {
  @PrimaryColumn()
  name: string;

  @Column()
  fullName: string;
}
