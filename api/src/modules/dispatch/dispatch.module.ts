import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DispatchService } from './dispatch.service';
import { DispatchGateway } from './dispatch.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { MissionsModule } from '../missions/missions.module';

@Module({
  imports: [
    JwtModule.register({}),
    NotificationsModule,
    forwardRef(() => MissionsModule),
  ],
  providers: [DispatchService, DispatchGateway],
  exports: [DispatchService, DispatchGateway],
})
export class DispatchModule {}
