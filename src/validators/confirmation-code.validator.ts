import {
  buildMessage,
  registerDecorator,
  ValidationOptions,
} from "class-validator";

export function IsConfirmationCode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    const re = new RegExp("^[0-9]{6}$");

    registerDecorator({
      name: "isConfirmationCode",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return typeof value === "string" && re.test(value);
        },
        defaultMessage: buildMessage(
          () => "Invalid confirmation code",
          validationOptions
        ),
      },
    });
  };
}
