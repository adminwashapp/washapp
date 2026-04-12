import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { WashersService } from './washers.service';
import { WashersController } from './washers.controller';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [WashersController],
  providers: [WashersService],
  exports: [WashersService],
})
export class WashersModule {}
