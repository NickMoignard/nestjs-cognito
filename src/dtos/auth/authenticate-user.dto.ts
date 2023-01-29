import { IsValidPassword } from "../../validators/password.validator";
import { BaseDto } from "../base.dto";

export class AuthenticateUserDto extends BaseDto {
  @IsValidPassword()
  password: string;
}
