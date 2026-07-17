import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  Body,
} from '@nestjs/common';
import { Request } from 'express';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard, GoogleAuthGuard /*, AppleAuthGuard*/ } from './guards';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

interface RequestWithUser extends Request {
  user: Omit<User, 'password'>;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
    const result = this.authService.login(req.user);
    // res.redirect(`myapp://login?token=${result.access_token}`);
    res.json(result);
  }

  // @UseGuards(AppleAuthGuard)
  // @Get('apple')
  // appleAuth() {}

  // @UseGuards(AppleAuthGuard)
  // @Post('apple/callback')
  // appleAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
  //   const result = this.authService.login(req.user);
  //   res.redirect(`myapp://login?token=${result.access_token}`);
  // }
}
