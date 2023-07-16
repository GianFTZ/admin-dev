import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { JwtService } from "@nestjs/jwt";
import axios from 'axios'
import { InviteCompanyDto, CreateCompanyDto, filterCollaboratorDto, getCollaboratorDto, removeCollaboratorDto } from "../models";
import { PrismaService } from "../../infra";
import { transporter } from "../../../common";
import { randomUUID } from "node:crypto";

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private mailerService: MailerService,
    private jwtService: JwtService
  ) { }

  public async invite(company: InviteCompanyDto) {
    Logger.log(`enviando e-mail convite para ${company.email} `)
    const token = await this.jwtService.signAsync({ email: company.email, name: company.name })
    Logger.log(`email: ${JSON.stringify(this.jwtService.decode(token))}`)
    const mailData = {
      from: `${process.env.EMAIL_USER}`,
      to: company.email,
      subject: "Invite Link",
      text: `${process.env.OUR_URL}/invite?token=${token}`
    }
    Logger.log({ token })
    Logger.log(await transporter.sendMail(mailData))
    await this.prisma.pendingColaborator.create({
      data: {
        Enterprise: {
          connect: {
            name: company.name
          }
        },
        email: company.email
      }
    })
    Logger.log(await this.prisma.pendingColaborator.findMany())
  }

  public async mock() {
    Logger.log("b")
    for (let i = 0; i < 1e2; i++) {
      Logger.log("c")
      await this.prisma.enterprise.update({
        where: {
          name: "gian-company"
        },
        data: {
          colaborators: {
            create: {
              email: `${randomUUID()}${i}@mail.com`,
              name: `${randomUUID()}${i}`
            }
          }
        }
      })
    }
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
    if (!findUser || !enterprise) {
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
    return await this.prisma.enterprise.findMany({
      where: { name: enterprise.name }, include: {
        colaborators: true
      }
    })
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

  public async getPendingCollaborators(dto: getCollaboratorDto) {
    return await this.prisma.enterprise.findMany({
      where: {
        name: dto.companyName
      },
      select: {
        pendingColaborators: true
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
  public async removeCollaborators(dto: removeCollaboratorDto) {
    try {
      const company = await this.prisma.enterprise.findUnique({
        where: {
          name: dto.companyName
        },
        select: {
          colaborators: true
        }
      })

      const colaboratorIndex = company.colaborators.findIndex(colaborator => colaborator.name === dto.collaboratorName) + 1
      if (colaboratorIndex == -1) {
        throw new NotFoundException("Colaborator not found in database to remove")
      }
      const deletedColaborator = company.colaborators.splice(colaboratorIndex, 1);
      if (deletedColaborator.length === 0) {
        throw new BadRequestException("Something went wrong while trying to remove colaborator")
      }
      await this.prisma.enterprise.update({
        where: {
          name: dto.companyName
        },
        data: {
          colaborators: {
            delete: {
              id: deletedColaborator[0].id
            }
          }
        }
      });
      return deletedColaborator
    }
    catch (error) {
      throw error
    }
  }
}