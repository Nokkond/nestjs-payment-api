import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionsService {
  constructor(private usersService: UsersService) {}

  async process(userId: number, dto: CreateTransactionDto) {
    if (dto.action === 'debit') {
      return this.usersService.charge(userId, { amount: dto.amount });
    } else if (dto.action === 'credit') {
      return this.usersService.refill(userId, { amount: dto.amount });
    } else {
      throw new BadRequestException('Invalid action');
    }
  }
}