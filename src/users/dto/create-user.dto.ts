import { IsEmail, IsString } from "class-validator";

export class CreateUserDto {
    @IsString({ message: 'name must be a string' })
    name!: string;
    @IsEmail({}, { message: 'email must be a valid email' })
    email!: string;
    @IsString({ message: 'password must be a string' })
    password!: string;
}
