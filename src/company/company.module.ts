import { Module } from '@nestjs/common';
import { CompanyController } from './presentation/controllers/company.controller';
import { CompanyService } from './presentation/services/company.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { PrismaService } from './infra/prisma/prisma.service';
import { PrismaModule } from './infra/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST, //host smtp
        secure: Number(process.env.EMAIL_PORT) === 465, //regras de segurança do serviço smtp
        port: Number(process.env.EMAIL_PORT), // porta
        auth: { //dados do usuário e senha
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false,
        },
        requireTLS: true
      },
      defaults: { // configurações que podem ser padrões
        from: '"',
      },
    }),
  ],
  controllers: [CompanyController],
  providers: [CompanyService, PrismaService],

})
export class CompanyModule { }
