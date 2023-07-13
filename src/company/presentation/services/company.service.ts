import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InviteCompanyDto, CreateCompanyDto } from "../models";
import { MailerService } from "@nestjs-modules/mailer";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { createTransport } from "nodemailer";
import { JwtService } from "@nestjs/jwt";
import axios from 'axios'
import { transporter } from "src/common/mail";
import { filterCollaboratorDto, getCollaboratorDto } from "../models/get-collaborator";

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private mailerService: MailerService,
    private jwtService: JwtService
  ) { }

  public async invite(company: InviteCompanyDto ) {
    Logger.log(`enviando e-mail convite para ${company.email} `)
    const token = await this.jwtService.signAsync({ email: company.email, name: company.name })
    const mailData = {
      from: `${process.env.EMAIL_USER}`,
      to: company.email,
      subject: "Invite Link",
      text: `${process.env.OUR_URL}/invite?token=${token}`
    }
    Logger.log({token})
    Logger.log(await transporter.sendMail(mailData))
    await this.prisma.pendingColaborator.create({
      data: {
        Enterprise: {
          connect: {name: company.name}
        },
        email: company.email
      }
    })
  }

  public async verifyInvite(token: string) {
    const { data: { email, name } } = await axios.post<{ email: string, name: string }>(process.env.VAS_API_URL, {
      refreshToken: token
    })
    
    const findUser = await this.prisma.pendingColaborator.findFirst({
      where: {
        email: email
      }
    })
    const enterprise = await this.prisma.enterprise.findUnique({
      where: { id: findUser.enterpriseId }
    })
    if(!findUser || !enterprise) {
      throw new Error("do later")
    }
    await this.prisma.enterprise.update({
      where: {
        name: enterprise.name
      },
      data: {
        colaborators: {
          create: {
            email: email,
            name: name.toLowerCase(),
          }
        }
      }
    })
    await this.prisma.pendingColaborator.deleteMany({
      where: { email: email }
    })
    return await this.prisma.enterprise.findMany({ where: { name: enterprise.name }, include: {
      colaborators: true
    }})
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
          active: true,
          colaborators: true
        }
      })
      if (companies.length === 0) { 
        throw new NotFoundException('No companies registered in the database')
      }
      return companies
    }
    catch (error) {
      Logger.error(error)
      throw error
    }
  }

  public async getCollaborators(dto: getCollaboratorDto) {
    return await this.prisma.enterprise.findMany({
      where: {
        name: dto.companyName
      },
      select: {
        colaborators: true
      }
    })
  }

  public async filterCollaborators(dto: filterCollaboratorDto) {
    return await this.prisma.enterprise.findMany({
      where: {
        name: dto.companyName
      },
      select: {
        colaborators: {
          where: {
            name: {
              startsWith: dto.filter
            }
          }
        }
      }
    })
  }
}