import {
  Controller, Post, Get, Patch, Delete, Param, Body, Query,
  UseInterceptors, UploadedFile, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApplicationsService } from './applications.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

class CreateApplicationDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsString() email: string;
  @IsString() phone: string;
  @IsString() city: string;
  @IsString() zone: string;
  @IsString() transportType: string;
  @IsString() availability: string;
  @IsOptional() @IsString() experience?: string;
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean() hasEquipment: boolean;
  @IsOptional() @IsString() waveMoneyNumber?: string;
  @IsOptional() @IsString() preferredPayment?: string;
  @IsOptional() @IsString() profilePhotoUrl?: string;
  @IsOptional() @IsString() idDocumentUrl?: string;
  @IsOptional() @IsString() otherDocumentUrl?: string;
}

class UpdateApplicationStatusDto {
  @IsString() status: string;
  @IsOptional() @IsString() adminNote?: string;
}

@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  // Public: submit candidature
  @Post()
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  // Public: upload a document, returns the URL
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = `${process.env.API_URL || 'http://localhost:3001'}/uploads/applications/${file.filename}`;
    return { url: fileUrl };
  }

  // Admin only
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any)
  findAll(@Query('status') status?: string) {
    return this.applicationsService.findAll(status);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any)
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateApplicationStatusDto) {
    return this.applicationsService.updateStatus(id, dto.status, dto.adminNote);
  }

  @Post(':id/validate')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any)
  validateAndCreate(@Param('id') id: string) {
    return this.applicationsService.validateAndCreateAccount(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any)
  async deleteApplication(@Param('id') id: string) {
    await this.applicationsService.delete(id);
    return { success: true };
  }
}
