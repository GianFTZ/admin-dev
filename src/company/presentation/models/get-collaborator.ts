import { IsString } from "class-validator";

export class getCollaboratorDto {
  @IsString()
  public companyName: string
}


export class filterCollaboratorDto {
  @IsString()
  public companyName: string

  @IsString()
  public filter: string
}