import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, ArrayMinSize, IsEmail } from "class-validator";

export class InviteCompanyDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}

export class InviteUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}