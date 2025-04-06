import { IsNumber, IsPositive } from 'class-validator';

export class ChargeDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}