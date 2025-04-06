import { IsEnum, IsNumber, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsEnum(['debit', 'credit'])
  action: 'debit' | 'credit';

  @IsNumber()
  @Min(0.01)
  amount: number;
}