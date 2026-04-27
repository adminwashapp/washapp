import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { IsString, IsOptional } from 'class-validator';

class ResolveComplaintDto {
  @IsString()
  resolutionNote: string;
}

class WithdrawalActionDto {
  @IsString()
  status: 'APPROVED' | 'PAID' | 'REJECTED';
}

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN' as any)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('washers')
  getWashers(
    @Query('status') status: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.adminService.getWashers(status, parseInt(page) || 1, parseInt(limit) || 20);
  }

  @Patch('washers/:id/activate')
  activateWasher(@Param('id') id: string) {
    return this.adminService.activateWasher(id);
  }

  @Patch('washers/:id/suspend')
  suspendWasher(@Param('id') id: string) {
    return this.adminService.suspendWasher(id);
  }

  @Patch('washers/:id/validate-training')
  validateTraining(@Param('id') id: string) {
    return this.adminService.validateWasherTraining(id);
  }

  @Patch('washers/:id/validate-test')
  validateTest(@Param('id') id: string) {
    return this.adminService.validateWasherTest(id);
  }

  @Patch('washers/:id/validate-equipment')
  validateEquipment(@Param('id') id: string) {
    return this.adminService.validateWasherEquipment(id);
  }

  @Get('missions')
  getMissions(
    @Query('status') status: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.adminService.getMissions(status, parseInt(page) || 1, parseInt(limit) || 20);
  }

  @Get('complaints')
  getComplaints(@Query('status') status: string) {
    return this.adminService.getComplaints(status);
  }

  @Patch('complaints/:id/resolve')
  resolveComplaint(@Param('id') id: string, @Body() dto: ResolveComplaintDto) {
    return this.adminService.resolveComplaint(id, dto.resolutionNote);
  }

  @Get('ledger')
  getLedger(@Query('page') page: string, @Query('limit') limit: string) {
    return this.adminService.getLedger(parseInt(page) || 1, parseInt(limit) || 50);
  }

  @Get('withdrawals')
  getWithdrawals(@Query('status') status: string) {
    return this.adminService.getWithdrawals(status);
  }

  @Patch('withdrawals/:id')
  processWithdrawal(@Param('id') id: string, @Body() dto: WithdrawalActionDto) {
    return this.adminService.processWithdrawal(id, dto.status);
  }

  @Get('subscriptions')
  getSubscriptions() {
    return this.adminService.getSubscriptions();
  }

  @Get('clients')
  getClients(
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.adminService.getClients(search ?? '', parseInt(page) || 1, parseInt(limit) || 20);
  }

  @Get('clients/:id')
  getClientById(@Param('id') id: string) {
    return this.adminService.getClientById(id);
  }

  @Patch('clients/:id/ban')
  toggleClientBan(@Param('id') id: string) {
    return this.adminService.toggleClientBan(id);
  }

  @Delete('washers/:id')
  deleteWasher(@Param('id') id: string) {
    return this.adminService.deleteWasher(id);
  }

  @Delete('clients/:id')
  deleteClient(@Param('id') id: string) {
    return this.adminService.deleteClient(id);
  }

  @Post('notifications/test')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any)
  sendTestNotification(@Body() body: { userId: string; title: string; message: string }) {
    return this.adminService.sendTestNotification(body.userId, body.title, body.message);
  }
}