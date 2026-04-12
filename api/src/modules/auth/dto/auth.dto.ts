import { IsString, IsOptional, IsEmail, MinLength, IsMobilePhone } from 'class-validator';

export class RegisterClientDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterWasherDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  transportType?: string;

  @IsOptional()
  @IsString()
  orangeMoneyNumber?: string;
}

export class LoginDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  phone?: string;
  email?: string;
}

export class ResetPasswordDto {
  phone?: string;
  email?: string;
  code: string;
  newPassword: string;
}