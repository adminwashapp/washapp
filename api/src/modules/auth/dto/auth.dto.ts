import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

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

// LoginDto accepts phone OR email (washer app uses email, client app uses phone)
export class LoginDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

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