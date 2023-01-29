import { IsValidPassword } from "../../validators/password.validator";
import { BaseDto } from "../base.dto";

export class ChangePasswordDto extends BaseDto {
  @IsValidPassword()
  currentPassword: string;

  @IsValidPassword()
  newPassword: string;
}
