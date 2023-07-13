import { Controller, Get, Query, Redirect, UseFilters } from '@nestjs/common';
import { CompanyService } from '../services';
import { HttpExceptionFilter } from '../../../common';

@Controller('/invite')
export class InviteController {
  constructor(
    private companyService: CompanyService
  ) { }


  @Get("/verify")
  @UseFilters(new HttpExceptionFilter())
  public async verifyInvite(
    @Query("refresh_token") token: string,
  ) {
    return this.companyService.verifyInvite(token)
  }

  @Get()
  @Redirect(process.env.VAS_URL+"?redirect_url="+process.env.OUR_URL+"/invite/verify")
  public async invite(){}

}
