import { IsMFAPreferenceType } from "../../validators/mfa-preference-type.validator";
import { BaseDto } from "../base.dto";

export class SetUserMFAPreferenceDto extends BaseDto {
  @IsMFAPreferenceType()
  type: "sms" | "totp";
}
