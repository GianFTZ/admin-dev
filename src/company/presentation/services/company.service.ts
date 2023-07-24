import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { JwtService } from "@nestjs/jwt";
import axios from 'axios'
import { InviteCompanyDto, CreateCompanyDto, filterCollaboratorDto, getCollaboratorDto, removeCollaboratorDto, CreateRoleDto, AssignRoleDto, UpdateRolePermissonsDto, UpdateRoleNameDto, DeleteRoleDto, GetRoleDto, UpdateRoleStatusDto, deletePendingCollaboratorDto, GetRoleById } from "../models";
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
        email: company.email,
        link: `${process.env.OUR_URL}/invite?token=${token}`
      }
    })
    Logger.log(await this.prisma.pendingColaborator.findMany())
  }

  public async mock() {
    Logger.log("b")
    for (let i = 0; i < 1e2; i++) { // 100
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
          colaborators: true,
          roles: {
            include: {
              permissionsGroup: {
                include: {
                  permissions: true
                }
              }
            }
          }
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

  public async deletePendingCollaborator(dto: deletePendingCollaboratorDto) {
    return await this.prisma.enterprise.update({
      where: {
        name: dto.companyName
      },
      data: {
        pendingColaborators: {
          delete: {
            id: (await this.prisma.pendingColaborator.findFirst({
              where: {
                email: dto.email
              },
              select: {
                id: true
              }
            })).id
          }
        }
      },
      select: {
        registration: true
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
      const deletedColaborator = await this.prisma.enterprise.update({
        where: {
          name: dto.companyName
        },
        data: {
          colaborators: {
            delete: {
              id: (await this.prisma.colaborator.findFirst({
                where: {
                  Enterprise: {
                    name: dto.companyName
                  },
                  AND: {
                    name: dto.collaboratorName
                  }
                },
                select: {
                  id: true
                }
              })).id
            }
          },
          updateAt: new Date()
        },
        select: {
          updateAt: true
        }
      })
      return deletedColaborator
    }
    catch (error) {
      throw error
    }
  }

  public async createRole(dto: CreateRoleDto) {
    return await this.prisma.enterprise.update({
      where: {
        name: dto.companyName
      },
      data: {
        roles: {
          create: {
            name: dto.name,
            users: 0,
            permissionsGroup: {
              connect: [{ id: "default" }, { id: "default2" }]
            }
          }
        }
      },
      select: {
        roles: {
          include: {
            permissionsGroup: true
          }
        }
      }
    })
  }


  public async updateRoleName(dto: UpdateRoleNameDto) {
    return await this.prisma.enterprise.update({
      where: {
        name: dto.companyName
      },
      data: {
        roles: {
          update: {
            where: {
              id: (await this.prisma.role.findFirst({
                where: {
                  Enterprise: {
                    name: dto.companyName
                  },
                  AND: {
                    name: dto.oldName
                  }
                },
                select: {
                  id: true
                }
              })).id
            },
            data: {
              name: {
                set: dto.name
              }
            }
          }
        }
      },
      select: {
        roles: {
          where: {
            name: dto.name
          },
          select: {
            name: true
          }
        }
      }
    })
  }

  public async assignRole(dto: AssignRoleDto) {
    return await this.prisma.enterprise.update({
      where: {
        name: dto.companyName
      },
      data: {
        colaborators: {
          update: {
            where: {
              id: (await this.prisma.colaborator.findFirst({
                where: {
                  Enterprise: {
                    name: dto.companyName
                  },
                  AND: {
                    name: dto.collaboratorName
                  }
                },
                select: {
                  id: true
                }
              })).id
            },
            data: {
              role: {
                connect: {
                  id: (await this.prisma.role.findFirst({
                    where: {
                      name: dto.roleName
                    },
                    select: {
                      id: true
                    }
                  })).id
                }
              }
            }
          }
        }
      },
      select: {
        colaborators: {
          where: {
            name: dto.collaboratorName
          },
          include: {
            role: {
              include: {
                permissionsGroup: true
              }
            }
          }
        }
      }
    })
  }

  public async deleteRole(dto: DeleteRoleDto) {
    return await this.prisma.enterprise.update({
      where: {
        name: dto.companyName
      },
      data: {
        roles: {
          delete: {
            id: (await this.prisma.role.findFirst({
              where: {
                Enterprise: {
                  name: dto.companyName
                },
                AND: {
                  name: dto.roleName
                }
              },
              select: {
                id: true
              }
            })).id
          }
        }
      },
      select: {
        roles: true
      }
    })
  }

  public async getRoles(dto: GetRoleDto) {
    return await this.prisma.enterprise.findFirst({
      where: {
        name: dto.companyName
      },
      select: {
        roles: {
          select: {
            id: true,
            users: true,
            status: true,
            name: true,
            createdAt: true,
            createdBy: true
          }
        }
      }
    })
  }

  public async updateRolePermissions(dto: UpdateRolePermissonsDto) {
    Logger.log({ a: "oi" })
    const transaction = await this.prisma.$transaction(
      dto.permissionsGroup.map(permissionGroup => {
        const a = this.prisma.permissionGroup.update({
          where: {
            id: permissionGroup.id
          },
          data: {
            active: permissionGroup.active,
            label: permissionGroup.label,
          }
        })
        // permissionGroup.permissions.map(permission => {
        //   Logger.log( this.prisma.permissionGroup.update({
        //     where: {
        //       id: permissionGroup.id
        //     },
        //     data: {
        //       permissions: {
        //         update: {
        //           where: {
        //             id: permission.id
        //           },
        //           data: {
        //             action: permission.action,
        //             active: permission.active,
        //             description: permission.description,
        //             label: permission.label
        //           }
        //         }
        //       }
        //     },
        //     select: {
        //       permissions: true
        //     }
        //   }))
        // })
        return a
      })
    )
    Logger.log({ transaction })
    return transaction
  }

  public async updateRoleStatus(dto: UpdateRoleStatusDto) {
    return await this.prisma.enterprise.update({
      where: {
        name: dto.companyName
      },
      data: {
        roles: {
          update: {
            where: {
              id: (await this.prisma.role.findFirst({
                where: {
                  Enterprise: {
                    name: dto.companyName
                  },
                  AND: {
                    name: dto.roleName
                  }
                },
                select: {
                  id: true
                }
              })).id
            },
            data: {
              status: {
                set: dto.status
              }
            }
          }
        }
      },
      select: {
        roles: {
          where: {
            name: dto.roleName
          }
        }
      }
    })
  }

  public async getRoleGroup(dto: GetRoleDto) {
    return await this.prisma.role.findFirst({
      where: {
        Enterprise: {
          name: dto.companyName
        }
      },
      select: {
        permissionsGroup: {
          where: {
            id: "default"
          },
          include: {
            permissions: true
          }
        }
      }
    })
  }

  public async getRoleId(dto: GetRoleById) {
    return await this.prisma.role.findFirst({
      where: {
        Enterprise: {
          name: dto.companyName
        },
        AND: {
          id: dto.roleId
        }
      },
      select: {
        id: true,
        name: true,
        users: true,
        permissionsGroup: {
          include: {
            permissions: true
          }
        },
        status: true,
        createdAt: true,
        createdBy: true
      }
    })
  }

  public async teste(dto: UpdateRolePermissonsDto) {
    
    return (dto.permissionsGroup.map(pg => {
      return {
        permissions: pg.permissions
      }
    })).map(pg => pg.permissions.map(p => {
      return {
        id: p.id,
        permissionGroupId: p.permissionGroupId,
        active: p.active
      }
    })).flat().map(async i => {
      console.log( await this.prisma.permissions.update({
        where: {
          id: (await this.prisma.permissions.findFirst({
            where: {
              permissionGroupId: i.permissionGroupId,
              AND: {
                id: i.id
              }
            },
            select: {
              id: true
            }
          })).id
        },
        data: {
          active: i.active
        },
        select: {
          id: true,
          active: true,
          permissionGroupId: true
        }
      }))
      console.log("========================================")
    })
    
    //  where: {
    //       permissionGroupId: i.permissionGroupId,
    //       AND: {
    //         id: i.id
    //       }
    //     },

    // return await this.prisma.permissions.findFirst({
    //   where: {
    //     permissionGroupId: "default",
    //     AND: {
    //         id: "da9214f8-8d54-4450-a8df-cf24b26b0b7d"
    //       }
    //     }

    //   }
    // )
    
    // return this.prisma.permissionGroup.findFirst({
    //   where: {
    //     id: "default"
    //   },
    //   select: {
    //     permissions: {
    //       where: {
    //         id: "da9214f8-8d54-4450-a8df-cf24b26b0b7d"
    //       }
    //     }
    //   }
    // })






    // return await this.prisma.permissions.update({
    //   where: {
    //     id: "da9214f8-8d54-4450-a8df-cf24b26b0b7d"
    //   },
    //   data: {
    //     active: true,
    //   }
    // })

    
    // const roleGroup = await this.prisma.role.findFirst({
    //   where: {
    //     Enterprise: {
    //       name: dto.companyName
    //     }
    //   },
    //   select: {
    //     id: true,
    //     permissionsGroup: {
    //       include: {
    //         permissions: true
    //       }
    //     }
    //   }
    // })
    // roleGroup.permissionsGroup.map( pg => {
    //   Logger.log(pg)
    // })
    // roleGroup.permissionsGroup.map(async (e, i) => {
    //   const result = await this.prisma.role.update({
    //     where: {
    //       id: roleGroup.id
    //     },
    //     data: {
    //       permissionsGroup: {
    //         update: {
    //           where: {
    //             id: e.id
    //           },
    //           data: {
    //             active: e.active
    //           }
    //         }
    //       }
    //     },
    //     select: {
    //       permissionsGroup: {
    //         include: {
    //           permissions: true
    //         }
    //       }
    //     }
    //   })
    //   result.permissionsGroup[i].permissions.map(async permission => {
    //     return await this.prisma.role.update({
    //       where: {
    //         id: roleGroup.id
    //       },
    //       data: {
    //         permissionsGroup: {
    //           update: {
    //             where: {
    //               id: e.id
    //             },
    //             data: {
    //               permissions: {
    //                 update: {
    //                   where: {
    //                     id: permission.id
    //                   },
    //                   data: {
    //                     active: permission.active
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       },
    //       select: {
    //         permissionsGroup: {
    //           include: {
    //             permissions: true
    //           }
    //         }
    //       }
    //     })
    //   })

    // })
    // return permissionsGroups

    //   await this.prisma.role.update({
    //     where: {
    //       id: (await this.prisma.role.findFirst({
    //         where: {
    //           name: dto.roleName
    //         },
    //         select: {
    //           id: true
    //         }
    //       })).id
    //     },
    //     data: {
    //       permissionsGroup: {
    //         update: {
    //           where: {
    //             id: "default"
    //           },
    //           data: {
    //             permissions: {
    //               update: {
    //                 where: {
    //                   id: "17978e96-912f-45c6-bc81-13b0079dd717"
    //                 },
    //                 data: {
    //                   active: true
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     },
    //     select: {
    //       permissionsGroup: {
    //         include: {
    //           permissions: true
    //         }
    //       }
    //     }
    //   })
  }
}