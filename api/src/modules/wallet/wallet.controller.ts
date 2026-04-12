import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsNumber, Min } from 'class-validator';

class WithdrawDto {
  @IsNumber()
  @Min(1000)
  amount: number;

  @IsString()
  orangeMoneyNumber: string;
}

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  getWallet(@CurrentUser() user: any) {
    return this.walletService.getWallet(user.washerProfile.id);
  }

  @Get('ledger')
  getLedger(
    @CurrentUser() user: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.walletService.getLedger(
      user.washerProfile.id,
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
  }

  @Post('withdraw')
  withdraw(@CurrentUser() user: any, @Body() dto: WithdrawDto) {
    return this.walletService.requestWithdrawal(
      user.washerProfile.id,
      dto.amount,
      dto.orangeMoneyNumber,
    );
  }
}
