import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
  } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Создать транзакцию для пользователя' })
  @ApiParam({ name: 'userId', type: Number, example: 1 })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'Успешная транзакция' })
  processTransaction(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.service.process(userId, dto);
  }
}