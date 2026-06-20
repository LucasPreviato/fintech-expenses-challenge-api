import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    
    @IsString({ message: 'name must be a string' })
    @MinLength(3, { message: 'name must be at least 3 characters long' })
    name!: string;
    @IsEmail({}, { message: 'email must be a valid email' })
    email!: string;
    @IsString({ message: 'password must be a string' })
    @MinLength(8, { message: 'password must be at least 8 characters long' })
    password!: string;
}
