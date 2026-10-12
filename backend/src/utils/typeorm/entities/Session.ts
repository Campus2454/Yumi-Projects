import { ISession } from 'connect-typeorm';
import { Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
export class Session implements ISession {
  @Index()
  @Column('bigint')
  expiredAt: number;

  @PrimaryColumn('varchar', { length: 64 })
  id: string = '';

  @Column('text')
  json: string = '';

  @DeleteDateColumn()
  destroyedAt: Date;
}