import { IsValidPassword } from "../../validators/password.validator";
import { BaseDto } from "../base.dto";

export class RegisterUserDto extends BaseDto {
  @IsValidPassword()
  password: string;
}
