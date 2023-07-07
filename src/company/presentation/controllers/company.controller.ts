import { Body, Controller, Post } from '@nestjs/common';
import { InviteCompanyDto, InviteUserDto } from '../models/invite-company';
import { CompanyService } from '../services/company.service';

@Controller('/company')
export class CompanyController {
  constructor(
    private companyService: CompanyService
  ){}
  
  @Post('/invite')
  /**
   * @Param company.name
   * @Param user
   */
  public async invite(
    @Body() inviteCompanyDto: InviteCompanyDto,
    @Body() user: InviteUserDto
  ) {
    return this.companyService.invite(inviteCompanyDto, user)
  }
}
