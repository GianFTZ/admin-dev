const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("Starting create gian-company")
  await prisma.enterprise.create({
    data: {
      id: "default",
      name: "gian-company",
      nickname: "gcompany",
      active: true,
      registration: "12345566"
    }
  })
  console.log("Successfully created")
  console.log("Starting create role default")
  await prisma.role.create({
    data: {
      id: "default",
      name: "default",
      Enterprise: {
        connect: {
          id: "default"
        }
      }
    }
  })
  console.log("Successfully created")
  console.log("Starting create user management role permissions")
  await prisma.permissionGroup.create({
    data: {
      Role: {
        connect: {
          id: "default"
        }
      },
      active: true,
      label: "User management",
      permissions: {
        createMany: {
          data: [
            {
              action: 'add.invite.user',
              label: 'Invite users',
              description: 'Ability to invite new users',
              active: true
            },
            {
              action: 'add.promote.user',
              label: 'Promote users',
              description: 'Ability to promote users',
              active: true
            },
            {
              action: 'add.demote.user',
              label: 'Demote users',
              description: 'Ability to demote users',
              active: true
            },
            {
              action: 'add.remove.user',
              label: 'Remove users',
              description: 'Ability to remove users',
              active: true
            },
          ]
        }
      }
    }
  })
  console.log("Successfully created")
  console.log("Starting create enterprise management role permissions")
  await prisma.permissionGroup.create({
    data: {
      Role: {
        connect: {
          id: "default"
        }
      },
      active: true,
      label: "Enterprise management",
      permissions: {
        createMany: {
          data: [
            {
              action: 'add.editname.business',
              label: 'Edit business name',
              description: 'Ability to change enterprise s name',
              active: false
            },
            {
              action: 'add.updatelogo.business',
              label: 'Update logo',
              description: 'Ability to change enterprise s logotype',
              active: false
            },
            {
              action: 'add.delete.business',
              label: 'Delete enterprise',
              description: 'Ability to delete enterprise',
              active: false
            },
            {
              action: 'add.create.roles',
              label: 'Create roles',
              description: 'Ability to create roles',
              active: true
            },
            {
              action: 'add.edit.roles',
              label: 'Edit roles',
              description: 'Ability to edit user role permissions',
              active: true
            },
            {
              action: 'add.delete.roles',
              label: 'Delete roles',
              description: 'Ability to delete roles',
              active: true
            },
          ]
        }
      }
    }
  })

}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })