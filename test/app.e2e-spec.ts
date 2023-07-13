import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from './../src/app.module';
import { CreateCompanyDto } from '../src/company/presentation';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient()
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });


  
  describe('POST /company/create', () => {
    test('should return 200 and create a new company if valid params was provided', async () => {
      const dto: CreateCompanyDto = {
        name: `${randomUUID() + "valid_company"}`,
        nickname: "valid_nickname_company",
        registration: "valid_registration",
        active: true
      }
      const response = await request(app.getHttpServer()).post('/company/create').send(dto)
      expect(response.status).toEqual(200)
    })
    test('should return 400 if name was not provided', async () => {
      const dto: CreateCompanyDto = {
        name: "",
        nickname: "valid_nickname_company",
        registration: "valid_registration",
        active: true
      }
      const response = await request(app.getHttpServer()).post('/company/create').send(JSON.stringify(dto))
      expect(response.status).toEqual(400)
    })
    test('should return 400 if nickname was not provided', async () => {
      const dto: CreateCompanyDto = {
        name: `${randomUUID() + "valid_company"}`,
        nickname: "",
        registration: "valid_registration",
        active: true
      }
      const response = await request(app.getHttpServer()).post('/company/create').send(JSON.stringify(dto))
      expect(response.status).toEqual(400)
    })
    test('should return 400 if registration was not provided', async () => {
      const dto: CreateCompanyDto = {
        name: `${randomUUID() + "valid_company"}`,
        nickname: "valid_nickname_company",
        registration: "",
        active: true
      }
      const response = await request(app.getHttpServer()).post('/company/create').send(JSON.stringify(dto))
      expect(response.status).toEqual(400)
    })
    test('should return 400 if active was not provided', async () => {
      const dto: CreateCompanyDto = {
        name: `${randomUUID() + "valid_company"}`,
        nickname: "valid_nickname_company",
        registration: "valid_registration",
        active: null
      }
      const response = await request(app.getHttpServer()).post('/company/create').send(dto)
      expect(response.status).toEqual(400)
    })
    
    test('should return 403 if company already exists', async () => {
      const dto: CreateCompanyDto = {
        name: "valid_company",
        nickname: "valid_nickname_company",
        registration: "valid_registration",
        active: true
      }
      await request(app.getHttpServer()).post('/company/create').send(dto)
      const response = await request(app.getHttpServer()).post('/company/create').send(dto)
      expect(response.status).toEqual(403)
    })
  })
  
  describe('POST /company/collaborators/filter', () => {
    test('should return 200 and filter an valid colaborator with valid params provided', async () => {
      await prisma.enterprise.update({
        where: {
          name: "valid_company"
        },
        data: {
          colaborators: {
            create: {
              name: "valid_colaborator_name",
              email: "valid_colaborator@email.com"
            }
          }
        }
      })

      const response = await request(app.getHttpServer()).post('/company/collaborators/filter').send({
        companyName: "valid_company",
        filter: "valid_colaborator_name"
      })
      expect(response.status).toEqual(200)
    })
    test('should return 404 if no colaborator was found', async () => { 
      const response = await request(app.getHttpServer()).post('/company/collaborators/filter').send({
        companyName: "invalid_company",
        filter: "invalid_colaborator_name"
      })
      expect(response.status).toEqual(404)
    })
  })

  describe('POST /company/read', () => {
    test('should return 200 and read all companies registered', async () => {
      const response = await request(app.getHttpServer()).post('/company/read')
      expect(response.status).toEqual(200)
    })
    test('should return 404 if something went wrong while trying to read companies', async () => {
      await prisma.$transaction([
        prisma.enterprise.deleteMany()
      ])
      const response = await request(app.getHttpServer()).post('/company/read')
      expect(response.status).toEqual(404)
    })
  });
    
})

  

