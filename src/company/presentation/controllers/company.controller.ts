import { BadRequestException, Body, Controller, ForbiddenException, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CompanyService } from '../services';
import { CreateCompanyDto, InviteCompanyDto, filterCollaboratorDto,  getCollaboratorDto } from '../models';


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

  @Get("/collaborators")
  public getCollaborators(@Body() dto: getCollaboratorDto) {
    return this.companyService.getCollaborators(dto)
  }

  @Post("/collaborators/filter")
  public async getCollaboratorsFilter(@Body() dto: filterCollaboratorDto, @Res() res: Response){
    const colaboratorsFiltered = await this.companyService.filterCollaborators(dto)
    if (colaboratorsFiltered.length > 0) {
      res.status(HttpStatus.OK).json(colaboratorsFiltered)
    }
    else {
      res.status(HttpStatus.NOT_FOUND).json({
        message: "No colaborators found"
      })
    }
  }
}
