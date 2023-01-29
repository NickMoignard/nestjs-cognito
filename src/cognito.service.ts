import { Injectable } from "@nestjs/common";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  IAuthenticationCallback,
  UserData,
} from "amazon-cognito-identity-js";

import {
  ChangePasswordDto,
  ConfirmPasswordDto,
  GetUserAttributesDto,
  RegisterUserDto,
  ResendConfirmationDto,
  ConfirmRegistrationDto,
  DeleteAttributesDto,
  DeleteUserDto,
  DisableMFADto,
  ForgetDeviceDto,
  ForgotPasswordDto,
  GetDeviceDto,
  GetUserDataDto,
  GlobalSignOutDto,
  ListDevicesDto,
  SetDeviceStatusNotRememberedDto,
  SetDeviceStatusRememberedDto,
  SetUserMFAPreferenceDto,
  SignOutDto,
  UpdateAttributesDto,
  AuthenticateUserDto,
} from "./dtos";

@Injectable()
export class CognitoService {
  private userPool: CognitoUserPool;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ClientId: process.env.COGNITO_CLIENT_ID,
    });
  }

  /**
   * Confirming a registered, unauthenticated user using a confirmation code.
   */
  async confirmRegistration({
    email,
    confirmationCode,
  }: ConfirmRegistrationDto): Promise<unknown> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(
        confirmationCode,
        true,
        (error: unknown, result: unknown) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });
  }

  /**
   * Resend confirmation code to unauthenticated user
   */
  async resendConfirmation({ email }: ResendConfirmationDto): Promise<unknown> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode((error: Error, result: unknown) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }

  /**
   * Login
   */
  async authenticateUser(
    { email, password }: AuthenticateUserDto,
    options?: Omit<IAuthenticationCallback, "onSuccess" | "onFailure">
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      const onSuccess = (
        session: CognitoUserSession,
        _userConfirmationNecessary?: boolean
      ) => {
        resolve({
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        });
      };

      const onFailure = (error: unknown) => {
        reject(error);
      };

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess,
        onFailure,
        ...options,
      });
    });
  }

  /**
   * Retrieve MFA settings for User
   */
  async getUserData({ email }: GetUserDataDto): Promise<UserData> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.getUserData((error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }

  /**
   * Initiate forgot password flow for unauthenticated user.
   */
  async forgotPassword(
    { email }: ForgotPasswordDto,
    inputVerificationCode?: (data: unknown) => void
  ) {
    const cognitoUser = new CognitoUser({
      Username: email,
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
        inputVerificationCode,
      });
    });
  }

  /**
   * Confirm new password
   */
  async confirmPassword({
    email,
    confirmationCode,
    newPassword,
  }: ConfirmPasswordDto): Promise<string> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(confirmationCode, newPassword, {
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (error) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Change the current password for an authenticated user.
   */
  async changePassword(dto: ChangePasswordDto): Promise<"SUCCESS"> {
    const authenticationDetails = new AuthenticationDetails({
      Username: dto.email,
      Password: dto.currentPassword,
    });

    const cognitoUser = new CognitoUser({
      Username: dto.email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: () => {
          cognitoUser.changePassword(
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

  /**
   * Sign out from the application.
   */
  async signOut({ email }: SignOutDto): Promise<void> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve) => {
      cognitoUser.signOut(() => resolve());
    });
  }

  /**
   * Global sign out for an authenticated user(invalidates all issued tokens).
   */
  async globalSignOut({ email }: GlobalSignOutDto): Promise<string> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.globalSignOut({
        onSuccess: (msg: string) => {
          resolve(msg);
        },
        onFailure: (error) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Set preferred MFA method for the user.
   */
  async setUserMfaPreference({
    email,
    type,
  }: SetUserMFAPreferenceDto): Promise<string> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    const smsMfaSettings =
      type === "sms"
        ? {
            PreferredMfa: true,
            Enabled: true,
          }
        : null;
    const softwareTokenMfaSettings =
      type === "totp"
        ? {
            PreferredMfa: true,
            Enabled: true,
          }
        : null;

    return new Promise((resolve, reject) => {
      cognitoUser.setUserMfaPreference(
        smsMfaSettings,
        softwareTokenMfaSettings,
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });
  }

  /**
   * Disable MFA for user
   */
  async disableMFA({ email }: DisableMFADto): Promise<string> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.setUserMfaPreference(
        {
          PreferredMfa: false,
          Enabled: false,
        },
        {
          PreferredMfa: false,
          Enabled: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });
  }

  /**
   * List information about the current device.
   */
  async getDevice(dto: GetDeviceDto): Promise<string> {
    const cognitoUser = new CognitoUser({
      Username: dto.email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.getDevice({
        onSuccess: (result: string) => {
          resolve(result);
        },
        onFailure: (error) => {
          reject(error);
        },
      });
    });
  }

  /**
   * List all remembered devices for an authenticated user.
   */
  async listDevices({
    email,
    limit,
    paginationToken,
  }: ListDevicesDto): Promise<unknown> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.listDevices(limit, paginationToken ?? null, {
        onSuccess: (result: unknown) => {
          resolve(result);
        },
        onFailure: (error) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Remember a device.
   */
  async setDeviceStatusRemembered(
    dto: SetDeviceStatusRememberedDto
  ): Promise<string> {
    const cognitoUser = new CognitoUser({
      Username: dto.email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.setDeviceStatusRemembered({
        onSuccess: (result: string) => {
          resolve(result);
        },
        onFailure: (error: unknown) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Do not remember a device.
   */
  async setDeviceStatusNotRemembered({
    email,
  }: SetDeviceStatusNotRememberedDto): Promise<string> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.setDeviceStatusNotRemembered({
        onSuccess: (result: string) => {
          resolve(result);
        },
        onFailure: (error: unknown) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Forget the current device.
   */
  async forgetDevice({ email }: ForgetDeviceDto): Promise<string> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.forgetDevice({
        onSuccess: (result: string) => {
          resolve(result);
        },
        onFailure: (error: Error) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Delete an authenticated user.
   */
  async deleteUser({ email }: DeleteUserDto): Promise<string> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.deleteUser((error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }

  /**
   * Register a new user with the application.
   */
  async register<T extends RegisterUserDto>({
    email,
    password,
    ...dto
  }: T): Promise<CognitoUser> {
    const userAttributes = Object.keys(dto).map(
      (key) =>
        new CognitoUserAttribute({
          Name: key,
          Value: dto[key],
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

  /**
   * Retrieve user attributes for authenticated user
   */
  async getUserAttributes({
    email,
  }: GetUserAttributesDto): Promise<CognitoUserAttribute[]> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.getUserAttributes((error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }

  /**
   * Update user attributes.
   */
  async updateAttributes({
    email,
    ...rest
  }: UpdateAttributesDto): Promise<{ result?: string; details?: unknown }> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    const userAttributes = Object.keys(rest).map(
      (key) =>
        new CognitoUserAttribute({
          Name: key,
          Value: rest[key],
        })
    );

    return new Promise((resolve, reject) => {
      cognitoUser.updateAttributes(userAttributes, (error, result, details) => {
        if (error) {
          reject(error);
        }
        resolve({ result, details });
      });
    });
  }

  /**
   * Delete user attributes.
   */
  async deleteAttributes({
    email,
    attributeList,
  }: DeleteAttributesDto): Promise<string> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.deleteAttributes(attributeList, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
}
