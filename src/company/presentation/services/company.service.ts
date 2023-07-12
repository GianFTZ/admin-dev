import { BadRequestException, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { InviteCompanyDto, CreateCompanyDto } from "../models";
import { MailerService } from "@nestjs-modules/mailer";
import { codeVerificationTemplate } from "../view/code-verification-template";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PrismaService } from "../../infra/prisma/prisma.service";

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private mailerService: MailerService
  ) { }

  public async invite(company: InviteCompanyDto ) {
    Logger.log(`enviando e-mail convite para ${company.email} `)
    const mailData = {
      from: "routeflat@vilesoft.com.br",
      to: company.email,
      subject: "Verification code",
      html: codeVerificationTemplate("codigo fake")
    }
    Logger.log(await this.mailerService.sendMail(mailData))
    Logger.log(`e-mail enviado para ${company.email}`)
  }

  public async create(dto: CreateCompanyDto) {
    try {
      const company = await this.prisma.enterprise.create({
        data: {
          name: dto.name,
          nickname: dto.nickname,
          registration: dto.registration,
          active: dto.active
        },
        select: {
          id: true,
          name: true,
          registration: true,
          active: true
        }
      })
      return company
    }
    catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Enterprise already exists')
      }
      throw new BadRequestException('Something went wrong while trying to create a company')
    }
  }

  public async read() {
    try {   
      const companies = await this.prisma.enterprise.findMany({
        select: {
          id: true,
          name: true,
          nickname: true,
          registration: true,
          active: true
        }
      })
      return companies
    }
    catch (error) {
      Logger.error(error)
      throw new BadRequestException('Something went wrong while trying to read companies')
    }
  }

}