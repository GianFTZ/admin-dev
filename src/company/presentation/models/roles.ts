import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsString, isString } from "class-validator";

export class CreateRoleDto {

  @IsString()
  @IsNotEmpty()
  name: string

  // @IsArray()
  // @IsNotEmpty()
  // @Type(() => String)
  // permissions: string[]

  @IsString()
  @IsNotEmpty()
  companyName: string
}

export class UpdateRolePermissionsDto {

  @IsString()
  @IsNotEmpty()
  roleName: string

  // @IsArray()
  // @IsNotEmpty()
  // @Type(() => String)
  // permissionGroupId: string[]

  @IsBoolean()
  status: boolean

  @IsString()
  @IsNotEmpty()
  companyName: string

  @IsString()
  @IsNotEmpty()
  oldName: string
  
  @IsArray()
  @IsNotEmpty()
  permissionsGroup: any[]
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


export class GetRoleDto {

  @IsString()
  @IsNotEmpty()
  companyName: string
}

export class UpdateRoleStatusDto {
  @IsString()
  @IsNotEmpty()
  roleName: string

  @IsString()
  @IsNotEmpty()
  companyName: string

  @IsBoolean()
  status: boolean
}

export class GetRoleGroupDto {
  @IsString()
  @IsNotEmpty()
  companyName: string
}

export class GetRoleById {
  @IsString()
  @IsNotEmpty()
  companyName: string

  @IsString()
  @IsNotEmpty()
  roleId: string
}