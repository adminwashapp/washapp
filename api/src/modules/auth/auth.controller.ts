import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterClientDto, RegisterWasherDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/client')
  registerClient(@Body() dto: RegisterClientDto) {
    return this.authService.registerClient(dto);
  }

  @Post('register/washer')
  registerWasher(@Body() dto: RegisterWasherDto) {
    return this.authService.registerWasher(dto);
  }

  @Post('login/client')
  loginClient(@Body() dto: LoginDto) {
    return this.authService.loginClient(dto);
  }

  @Post('login/washer')
  loginWasher(@Body() dto: LoginDto) {
    return this.authService.loginWasher(dto);
  }

  @Post('login/admin')
  loginAdmin(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  refresh(@CurrentUser() user: any) {
    return this.authService.refreshTokens(user.id);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@CurrentUser() user: any, @Body() dto: RefreshTokenDto) {
    return this.authService.logout(user.id, dto.refreshToken);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@CurrentUser() user: any) {
    return user;
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('push-token')
  savePushToken(@Req() req: any, @Body('token') token: string) {
    return this.authService.savePushToken(req.user.sub, token);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('send-verification')
  sendEmailVerification(@Req() req: any) {
    return this.authService.sendEmailVerification(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('verify-email')
  verifyEmail(@Req() req: any, @Body('token') token: string) {
    return this.authService.verifyEmail(req.user.sub, token);
  }

  @Post('washer/request-otp')
  washerRequestOtp(@Body() body: { email: string }) {
    return this.authService.washerRequestOtp(body.email);
  }

  @Post('washer/verify-otp')
  washerVerifyOtp(@Body() body: { email: string; code: string }) {
    return this.authService.washerVerifyOtp(body.email, body.code);
  }

  // TEMP: Reset admin password
  @Get('reset-admin-temp')
  async resetAdminTemp() {
    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    await this.prisma.user.updateMany({
      where: { email: 'adminwashapp@gmail.com' },
      data: { passwordHash },
    });
    return { message: 'Password reset to: Admin123!' };
  }
}