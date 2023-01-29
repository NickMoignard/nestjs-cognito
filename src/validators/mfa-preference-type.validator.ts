import {
  buildMessage,
  registerDecorator,
  ValidationOptions,
} from "class-validator";

export function IsMFAPreferenceType(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isMFAPreferenceType",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return (
            typeof value === "string" && (value === "totp" || value === "sms")
          );
        },
        defaultMessage: buildMessage(
          () => "Invalid MFA type",
          validationOptions
        ),
      },
    });
  };
}
