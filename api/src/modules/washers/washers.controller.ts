import {
  Req,
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
} from '@nestjs/common';
import {
  AuthGuard } from '@nestjs/passport';
import {
  FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { WashersService } from './washers.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class UpdateFcmDto {
  @IsString()
  fcmToken: string;
}

@Controller('washers')
@UseGuards(AuthGuard('jwt'))
export class WashersController {
  constructor(private washersService: WashersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.washersService.getProfile(user.washerProfile.id);
  }

  @Get('reservations')
  getReservations(@CurrentUser() user: any) {
    return this.washersService.getReservations(user.washerProfile.id);
  }


  @Get('stats/today')
  getStatsToday(@Req() req: any) {
    return this.washersService.getStatsToday(req.user.washerProfileId);
  }
  @Get('earnings')
  getEarnings(@CurrentUser() user: any) {
    return this.washersService.getEarnings(user.washerProfile.id);
  }

  @Get('mission/active')
  getActiveMission(@CurrentUser() user: any) {
    return this.washersService.getActiveMission(user.washerProfile.id);
  }

  @Post('missions/:id/photo/:type')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/missions',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new Error('Seules les images JPG/PNG/WEBP sont acceptées'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadPhoto(
    @CurrentUser() user: any,
    @Param('id') missionId: string,
    @Param('type') photoType: 'BEFORE' | 'AFTER',
    @UploadedFile() file: Express.Multer.File,
  ) {
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const fileUrl = `${baseUrl}/uploads/missions/${file.filename}`;
    return this.washersService.uploadMissionPhoto(
      missionId,
      user.washerProfile.id,
      photoType.toUpperCase() as 'BEFORE' | 'AFTER',
      file.path,
      fileUrl,
    );
  }

  @Post('reservations/:id/cancel')
  cancelReservation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.washersService.cancelReservation(id, user.washerProfile.id);
  }

  @Post('fcm-token')
  updateFcmToken(@CurrentUser() user: any, @Body() dto: UpdateFcmDto) {
    return this.washersService.updateFcmToken(user.washerProfile.id, dto.fcmToken);
  }
}
