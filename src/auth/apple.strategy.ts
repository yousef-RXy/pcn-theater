import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-apple';
import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

export interface AppleProfile {
  id: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
  email?: string;
}

export interface AppleDecodedToken {
  email?: string;
  sub?: string;
  email_verified?: string | boolean;
}

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.APPLE_CLIENT_ID || 'dummy_id',
      teamID: process.env.APPLE_TEAM_ID || 'dummy_team',
      keyID: process.env.APPLE_KEY_ID || 'dummy_key_id',
      privateKeyString: (process.env.APPLE_PRIVATE_KEY || '').replace(
        /\\n/g,
        '\n',
      ),
      callbackURL:
        process.env.APPLE_CALLBACK_URL ||
        'http://localhost:3000/auth/apple/callback',
      scope: ['name', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: AppleProfile,
    done: (err: Error | null, user?: User | false) => void,
  ): Promise<void> {
    let email = profile?.email;

    if (!email && idToken) {
      const payload = JSON.parse(
        Buffer.from(idToken.split('.')[1], 'base64').toString(),
      ) as AppleDecodedToken;
      email = payload.email;
    }

    if (!email) {
      return done(
        new BadRequestException('No email returned from Apple account'),
      );
    }

    const userProfile = {
      email,
      firstName: profile?.name?.firstName || 'Apple',
      lastName: profile?.name?.lastName || 'User',
      provider: 'apple',
      providerId: profile?.id || 'apple_id',
    };

    const validatedUser = await this.authService.validateOAuthUser(userProfile);
    done(null, validatedUser);
  }
}
