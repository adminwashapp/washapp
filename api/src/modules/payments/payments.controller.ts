import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class ConfirmOrangeMoneyDto {
  @IsString()
  reference: string;
}

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('orange-money/:missionId/initiate')
  initiate(@Param('missionId') missionId: string, @CurrentUser() user: any) {
    return this.paymentsService.initiateOrangeMoney(missionId, user.clientProfile.id);
  }

  @Post('orange-money/:missionId/confirm')
  confirmOM(
    @Param('missionId') missionId: string,
    @CurrentUser() user: any,
    @Body() dto: ConfirmOrangeMoneyDto,
  ) {
    return this.paymentsService.confirmOrangeMoney(missionId, dto.reference, user.clientProfile.id);
  }

  @Post('cash/:missionId/confirm-client')
  confirmCashClient(@Param('missionId') missionId: string, @CurrentUser() user: any) {
    return this.paymentsService.confirmCashByClient(missionId, user.clientProfile.id);
  }

  @Post('cash/:missionId/confirm-washer')
  confirmCashWasher(@Param('missionId') missionId: string, @CurrentUser() user: any) {
    return this.paymentsService.confirmCashByWasher(missionId, user.washerProfile.id);
  }
}
