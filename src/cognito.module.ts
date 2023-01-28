import { Module } from "@nestjs/common";
import { CognitoJwtStrategy } from "./cognito-jwt.strategy";
import { CognitoService } from "./cognito.service";

Module({
  imports: [],
  providers: [CognitoService, CognitoJwtStrategy],
  exports: [CognitoService, CognitoJwtStrategy],
});
