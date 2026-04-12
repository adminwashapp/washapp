import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { MissionType, ServiceType, PaymentMethod } from '@prisma/client';

export class CreateMissionDto {
  @IsString()
  fullAddress: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsEnum(MissionType)
  missionType: MissionType;

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class ValidateMissionDto {
  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateRatingDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  stars: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateComplaintDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  description?: string;
}
