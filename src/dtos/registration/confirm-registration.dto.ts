import { IsConfirmationCode } from "../../validators/confirmation-code.validator";
import { BaseDto } from "../base.dto";

export class ConfirmRegistrationDto extends BaseDto {
  @IsConfirmationCode()
  confirmationCode: string;
}
