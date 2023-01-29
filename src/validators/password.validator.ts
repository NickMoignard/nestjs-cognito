import {
  buildMessage,
  registerDecorator,
  ValidationOptions,
} from "class-validator";

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    /* Minimum eight characters, at least one uppercase letter, one lowercase letter, one number, and one special character */
    const re = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-zd@$&+,:;=?@#|'<>.^*()%!-]{8,}$"
    );

    registerDecorator({
      name: "isValidPassword",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => {
          return typeof value === "string" && re.test(value);
        },
        defaultMessage: buildMessage(
          () => "Invalid password",
          validationOptions
        ),
      },
    });
  };
}
