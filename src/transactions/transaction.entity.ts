import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  action: 'debit' | 'credit';

  @Column({ type: 'decimal' })
  amount: number;

  @CreateDateColumn()
  ts: Date;
}