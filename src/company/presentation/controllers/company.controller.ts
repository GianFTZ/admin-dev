import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Logger, NotFoundException, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CompanyService } from '../services';
import { CreateCompanyDto, InviteCompanyDto, filterCollaboratorDto,  getCollaboratorDto, removeCollaboratorDto } from '../models';
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
    Logger.log({InviteCompanyDto: {
      name: inviteCompanyDto.name,
      email: inviteCompanyDto.email,
    }})
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

  @Post('/read')
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
  public async removeCollaborators(@Body() dto: removeCollaboratorDto, @Res() res: Response) { 
    const deletedColaborator = await this.companyService.removeCollaborators(dto)
    if (deletedColaborator.length === 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: "Something went wrong while trying to remove colaborator"
      })
    }
    else if (deletedColaborator instanceof NotFoundException) {
      res.status(HttpStatus.NOT_FOUND).json({
        message: "Colaborator not found in database to remove"
      })
    }
    else { 
      res.status(HttpStatus.OK).json(`Colaborator ${deletedColaborator[0].name} removed successfully`)
    }
  }
}
