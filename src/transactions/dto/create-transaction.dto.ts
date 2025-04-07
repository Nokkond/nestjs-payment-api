import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { ITransactionData } from '../../common/types/transaction.interface';

export class CreateTransactionDto implements ITransactionData {
  @ApiProperty({ enum: ['debit', 'credit'], example: 'debit' })
  @IsEnum(['debit', 'credit'])
  action: 'debit' | 'credit';

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0.01)
  amount: number;
}