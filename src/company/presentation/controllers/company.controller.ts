import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Logger, NotFoundException, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CompanyService } from '../services';
import { AssignRoleDto, CreateCompanyDto, CreateRoleDto, DeleteRoleDto, GetRoleById, GetRoleDto, GetRoleGroupDto, InviteCompanyDto, UpdateRoleNameDto, UpdateRolePermissionsDto, UpdateRoleStatusDto, deletePendingCollaboratorDto, filterCollaboratorDto,  getCollaboratorDto, removeCollaboratorDto } from '../models';
import { NotFoundError } from 'rxjs';


@Controller('/company')
export class CompanyController {
  constructor(
    private companyService: CompanyService
  ) { }

  @Post('/invite')
  /**
   * @Param company.name
   */
  public async invite(
    @Body() inviteCompanyDto: InviteCompanyDto,
  ) {
    return this.companyService.invite(inviteCompanyDto)
  }

  @Post('/create')
  public async create(@Body() createCompanyDto: CreateCompanyDto, @Res() res: Response) {
    const company = await this.companyService.create(createCompanyDto)
    if (company ) {
      res.status(HttpStatus.OK).json(company)
    }
    else if (company instanceof ForbiddenException) {
      res.status(HttpStatus.FORBIDDEN).json({
        message: "Enterprise already exists"
      })
    }
    else if(company instanceof BadRequestException){
      res.status(HttpStatus.BAD_REQUEST).json({
        message: "Something went wrong while trying to create a company"
      })
    }
  }

  @Get('/read')
  public async read(@Res() res: Response) {
    const companies = await this.companyService.read()
    if (companies.length > 0) {
      res.status(HttpStatus.OK).json(companies)
    }
    else if(companies instanceof BadRequestException) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: "Something went wrong while trying to read companies"
      })
    }
    else {
      res.status(HttpStatus.NOT_FOUND).json({
        message: 'No companies registered in the database'
      })
    }
  }

  @Post("/collaborators")
  public async getCollaborators(@Body() dto: getCollaboratorDto, @Res() res: Response) {
    const colaborators = await this.companyService.getCollaborators(dto)
    if(colaborators.length === 0) {
      res.status(HttpStatus.NOT_FOUND).json({
        message: "No colaborators found"
      })
    }
    res.status(HttpStatus.OK).json(colaborators)

  }

  @Post("/collaborators/mock")
  public async storeCollaborators() {
    Logger.log("a")
    return await this.companyService.mock()
  }
  

  @Post("/collaborators/pending")
  public async getPendingCollaborators(@Body() dto: getCollaboratorDto, @Res() res: Response) {
    const colaborators = await this.companyService.getPendingCollaborators(dto)
    if(colaborators.length === 0) {
      res.status(HttpStatus.NOT_FOUND).json({
        message: "No colaborators found"
      })
    }
    res.status(HttpStatus.OK).json(colaborators)

  }


  @Post("/collaborators/filter")
  public async getCollaboratorsFilter(@Body() dto: filterCollaboratorDto, @Res() res: Response){
    const colaboratorsFiltered = await this.companyService.filterCollaborators(dto)
    if (colaboratorsFiltered.length === 0) {
      res.status(HttpStatus.NOT_FOUND).json({
        message: `No colaborators found in this company: ${dto.companyName} with this filter: ${dto.filter}`
      })
    }
    res.status(HttpStatus.OK).json(colaboratorsFiltered)
  }

  @Delete("/collaborators/remove")
  public async removeCollaborators(@Body() dto: removeCollaboratorDto) { 
    return await this.companyService.removeCollaborators(dto)
  }

  @Delete("/collaborators/pending/remove")
  public async removePendingCollaborator(@Body() dto: deletePendingCollaboratorDto) { 
    return await this.companyService.deletePendingCollaborator(dto)
  }

  @Post("/roles/create")
  public async createRole(@Body() dto: CreateRoleDto) {
    return await this.companyService.createRole(dto)
  }

  @Post("/roles/assign")
  public async updateCollaboratorsRole(@Body() dto: AssignRoleDto){
    return await this.companyService.assignRole(dto)
  }

  @Post("/roles/permissions")
  public async updateRolePermissons(@Body() dto: UpdateRolePermissionsDto){
    return await this.companyService.updateRolePermissions(dto)
  }

  @Post("/roles/test")
  public async test(@Body() dto: UpdateRolePermissionsDto){
    return await this.companyService.teste(dto)
  }

  @Post("/roles/name")
  public async updateRoleName(@Body() dto: UpdateRoleNameDto){
    return await this.companyService.updateRoleName(dto)
  }

  @Delete("/roles")
  public async deleteRole(@Body() dto: DeleteRoleDto){
    return await this.companyService.deleteRole(dto)
  }

  @Post("/roles")
  public async getRoles(@Body() dto: GetRoleDto){
    return await this.companyService.getRoles(dto)
  }

  @Post("/roles/status")
  public async updateRoles(@Body() dto: UpdateRoleStatusDto){
    return await this.companyService.updateRoleStatus(dto)
  }

  @Post("/roles/group")
  public async getRolesGroup(@Body() dto: GetRoleGroupDto){
    return await this.companyService.getRoleGroup(dto)
  }

  @Post("/roles/id")
  public async getRoleId(@Body() dto: GetRoleById) {
    return await this.companyService.getRoleId(dto)
  }
}
