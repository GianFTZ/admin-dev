import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateCompanyDto {

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  nickname: string

  @IsString()
  @IsNotEmpty()
  registration: string

  @IsBoolean()
  @IsNotEmpty()
  active: boolean
}
