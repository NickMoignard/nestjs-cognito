import { IsEmail, IsNotEmpty } from "class-validator";

export class BaseDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
