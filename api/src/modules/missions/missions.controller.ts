import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MissionsService } from './missions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateComplaintDto,
  CreateMissionDto,
  CreateRatingDto,
  ValidateMissionDto,
} from './dto/mission.dto';

@Controller('missions')
@UseGuards(AuthGuard('jwt'))
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

  @Post()
  createMission(@CurrentUser() user: any, @Body() dto: CreateMissionDto) {
    return this.missionsService.createMission(user.clientProfile.id, dto);
  }

  @Get('my')
  getMyMissions(@CurrentUser() user: any) {
    return this.missionsService.getClientMissions(user.clientProfile.id);
  }

  @Get(':id')
  getMission(@Param('id') id: string, @CurrentUser() user: any) {
    return this.missionsService.getMission(id, user.id);
  }

  @Post(':id/validate')
  validateMission(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ValidateMissionDto,
  ) {
    return this.missionsService.validateMission(id, user.clientProfile.id, dto);
  }

  @Post(':id/rate')
  rateMission(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateRatingDto,
  ) {
    return this.missionsService.rateMission(id, user.clientProfile.id, dto);
  }

  @Post(':id/complaint')
  complainMission(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateComplaintDto,
  ) {
    return this.missionsService.complainMission(id, user.clientProfile.id, dto);
  }

  @Post(':id/cancel')
  cancelMission(@Param('id') id: string, @CurrentUser() user: any) {
    return this.missionsService.cancelMission(id, user.clientProfile.id);
  }
}
