import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService, PrismaModule } from './infra';
import { InviteController, CompanyController, CompanyService } from './presentation';

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
