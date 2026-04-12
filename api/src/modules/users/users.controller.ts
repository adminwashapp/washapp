import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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
}
