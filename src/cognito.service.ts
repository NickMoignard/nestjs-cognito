import { Injectable } from "@nestjs/common";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import {
  ChangePasswordDto,
  ConfirmPasswordDto,
  LoginDto,
  RegisterDto,
} from "./dto/";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";

@Injectable()
export class CognitoService {
  private userPool: CognitoUserPool;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ClientId: process.env.COGNITO_CLIENT_ID,
    });
  }

  async register<T extends LoginDto>(dto: T): Promise<CognitoUser> {
    const { email, password, ...rest } = dto;

    const userAttributes = Object.keys(rest).map(
      (key) =>
        new CognitoUserAttribute({
          Name: key,
          Value: rest[key],
        })
    );

    return new Promise((resolve, reject) => {
      this.userPool.signUp(
        email,
        password,
        userAttributes,
        null,
        (err, result) => {
          if (!result) {
            reject(err);
          } else {
            resolve(result.user);
          }
        }
      );
    });
  }

  async authenticate<T extends RegisterDto>(
    dto: T
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = dto;

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve({
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const cognitoUser = new CognitoUser({
      Username: dto.email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (error) => {
          reject(error);
        },
      });
    });
  }

  async confirmPassword(dto: ConfirmPasswordDto): Promise<string> {
    const cognitoUser = new CognitoUser({
      Username: dto.email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(dto.confirmationCode, dto.newPassword, {
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (error) => {
          reject(error);
        },
      });
    });
  }

  async changePassword(dto: ChangePasswordDto): Promise<"SUCCESS"> {
    const authenticationDetails = new AuthenticationDetails({
      Username: dto.email,
      Password: dto.currentPassword,
    });

    const userCognito = new CognitoUser({
      Username: dto.email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      userCognito.authenticateUser(authenticationDetails, {
        onSuccess: () => {
          userCognito.changePassword(
            dto.currentPassword,
            dto.newPassword,
            (err, result) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(result);
            }
          );
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }
}
