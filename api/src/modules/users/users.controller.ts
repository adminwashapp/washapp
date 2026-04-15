import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

class AddVehicleDto {
  @IsString() type: string;
  @IsString() brand: string;
  @IsString() model: string;
  @IsString() plateNumber: string;
  @IsOptional() @IsString() color?: string;
}

class AddAddressDto {
  @IsString() label: string;
  @IsString() fullAddress: string;
  @IsNumber() lat: number;
  @IsNumber() lng: number;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

class ActivateSubscriptionDto {
  @IsString() serviceType: string;
}

@Controller('clients')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getClientProfile(user.id);
  }

  @Post('vehicles')
  addVehicle(@CurrentUser() user: any, @Body() dto: AddVehicleDto) {
    return this.usersService.addVehicle(user.clientProfile.id, dto);
  }

  @Get('vehicles')
  getVehicles(@CurrentUser() user: any) {
    return this.usersService.getVehicles(user.clientProfile.id);
  }

  @Post('addresses')
  addAddress(@CurrentUser() user: any, @Body() dto: AddAddressDto) {
    return this.usersService.addAddress(user.clientProfile.id, dto);
  }

  @Get('addresses')
  getAddresses(@CurrentUser() user: any) {
    return this.usersService.getAddresses(user.clientProfile.id);
  }

  // ── ABONNEMENTS ────────────────────────────────────────────────────────────

  @Post('subscriptions')
  activateSubscription(@CurrentUser() user: any, @Body() dto: ActivateSubscriptionDto) {
    return this.usersService.activateSubscription(user.clientProfile.id, dto.serviceType);
  }

  @Get('subscriptions/active')
  getActiveSubscription(@CurrentUser() user: any) {
    return this.usersService.getActiveSubscription(user.clientProfile.id);
  }

  @Get('subscriptions')
  getSubscriptions(@CurrentUser() user: any) {
    return this.usersService.getSubscriptions(user.clientProfile.id);
  }

  @Delete('subscriptions')
  cancelSubscription(@CurrentUser() user: any) {
    return this.usersService.cancelSubscription(user.clientProfile.id);
  }
}