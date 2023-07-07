import { Injectable, Logger } from "@nestjs/common";
import { InviteCompanyDto, InviteUserDto } from "../models/invite-company";
import { PrismaService } from "src/company/infra/prisma/prisma.service";
import { MailerService } from "@nestjs-modules/mailer";
import { codeVerificationTemplate } from "../view/code-verification-template";

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private mailerService: MailerService
  ) {}

  public async invite(company: InviteCompanyDto, user: InviteUserDto) {
    Logger.log(`enviando e-mail convite para ${user.email} `)
    const mailData = {
      from: "routeflat@vilesoft.com.br",
      to: user.email,
      subject: "Verification code",
      html: codeVerificationTemplate("codigo fake")
    }
    await this.mailerService.sendMail(mailData)
    Logger.log(`e-mail enviado para ${user.email}`)
  }

}