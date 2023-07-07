import { Module } from '@nestjs/common';
import { CompanyModule } from './company/company.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PrismaModule } from './company/infra/prisma/prisma.module';

@Module({
  imports: [
    CompanyModule,
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
})
export class AppModule { }