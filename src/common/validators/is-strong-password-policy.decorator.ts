import { Matches, ValidationOptions } from 'class-validator';

export const PASSWORD_STRENGTH_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const PASSWORD_STRENGTH_MESSAGE =
  'password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character';

export function IsStrongPasswordPolicy(validationOptions?: ValidationOptions) {
  return Matches(PASSWORD_STRENGTH_REGEX, {
    message: PASSWORD_STRENGTH_MESSAGE,
    ...validationOptions,
  });
}
