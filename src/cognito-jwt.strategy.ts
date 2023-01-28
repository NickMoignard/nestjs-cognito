import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class CognitoJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      _audience: process.env.COGNITO_COGNITO_CLIENT_ID,
      issuer: process.env.COGNITO_AUTHORITY,
      algorithms: ["RS256"],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.COGNITO_AUTHORITY + "/.well-known/jwks.json",
      }),
    });
  }

  async validate(
    payload: Record<string, unknown> & { sub: string; email: string }
  ) {
    return { idUser: payload.sub, email: payload.email };
  }
}
