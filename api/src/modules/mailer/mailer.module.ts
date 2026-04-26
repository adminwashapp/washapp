import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SmsService } from './sms.service';

@Module({
  providers: [MailerService, SmsService],
  exports: [MailerService, SmsService],
})
export class MailerModule {}
