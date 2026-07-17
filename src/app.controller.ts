import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './auth/guards';

interface RequestWithJwtUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('profile')
export class AppController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req: RequestWithJwtUser) {
    return req.user;
  }
}
