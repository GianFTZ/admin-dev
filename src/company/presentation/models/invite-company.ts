import { IsString, IsNotEmpty, IsEmail } from "class-validator";

export class InviteCompanyDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}