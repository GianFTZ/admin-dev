import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsString, isString } from "class-validator";

export class CreateRoleDto {

  @IsString()
  @IsNotEmpty()
  name: string

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  permissions: string[]

  @IsString()
  @IsNotEmpty()
  companyName: string
}

export class UpdateRolePermissonsDto {

  @IsString()
  @IsNotEmpty()
  name: string

  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  permissions: string[]

  @IsString()
  @IsNotEmpty()
  companyName: string
}

export class UpdateRoleNameDto {

  @IsString()
  @IsNotEmpty()
  oldName: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  companyName: string
}


export class AssignRoleDto {

  @IsString()
  @IsNotEmpty()
  collaboratorName: string

  @IsString()
  @IsNotEmpty()
  roleName: string

  @IsString()
  @IsNotEmpty()
  companyName: string
}


export class DeleteRoleDto {
  
  @IsString()
  @IsNotEmpty()
  roleName: string

  @IsString()
  @IsNotEmpty()
  companyName: string
}


