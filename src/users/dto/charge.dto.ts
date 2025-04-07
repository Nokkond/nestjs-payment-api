import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';
import { IChargeData } from 'src/common/types/charge.interface';

export class ChargeDto implements IChargeData {
  @ApiProperty({ example: 100, description: 'Сумма в USD' })
  @IsNumber()
  @IsPositive()
  amount: number;
}