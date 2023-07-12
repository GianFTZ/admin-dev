import { Module } from '@nestjs/common';
import { CompanyController } from './presentation/controllers/company.controller';
import { CompanyService } from './presentation/services/company.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { PrismaService } from './infra/prisma/prisma.service';
import { PrismaModule } from './infra/prisma/prisma.module';
import { InviteController } from './presentation/controllers/invite.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    PrismaModule,
  ],
  controllers: [CompanyController, InviteController],
  providers: [CompanyService, PrismaService],

})
export class CompanyModule { }
