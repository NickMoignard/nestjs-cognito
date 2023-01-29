import { IsConfirmationCode } from "../../validators/confirmation-code.validator";
import { IsValidPassword } from "../../validators/password.validator";
import { BaseDto } from "../base.dto";

export class ConfirmPasswordDto extends BaseDto {
  @IsConfirmationCode()
  confirmationCode: string;

  @IsValidPassword()
  newPassword: string;
}
