import { BadRequestException, Body, Controller, ForbiddenException, Get, HttpStatus, Logger, Post, Query, Res, UseFilters } from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { HttpExceptionFilter } from 'src/common/exception';

@Controller('/invite')
export class InviteController {
  constructor(
    private companyService: CompanyService
  ) { }


  @Get()
  @UseFilters(new HttpExceptionFilter())
  public async invite(
    @Query("token") token: string,
  ) {
    console.log(`Invite ${token}`)
    return this.companyService.verifyInvite(token)
  }
}
