import { IsEmail, IsString } from "class-validator";

export class getCollaboratorDto {
  @IsString()
  public companyName: string
}

export class deletePendingCollaboratorDto {
  @IsString()
  public companyName: string

  @IsString()
  public email: string
}


export class filterCollaboratorDto {
  @IsString()
  public companyName: string

  @IsString()
  public filter: string
}

export class removeCollaboratorDto { 
  @IsString()
  public companyName: string

  @IsString()
  public collaboratorName: string

}