import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { randomUUID } from 'crypto';
import { CreateCompanyDto } from 'src/company/presentation/models';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

  });

  describe('POST /company/read', () => {
    test('should return all companies registered', async () => {
      const response = await request(app.getHttpServer()).post('/company/read')
      expect(response.status).toEqual(200)
    })
  });

  describe('POST /company/create', () => { 
    test('should create a new company if valid params was provided', async () => {
      const dto: CreateCompanyDto = {
        name: `${randomUUID()+"valid_company"}`,
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
        name: `${randomUUID()+"valid_company"}`,
        nickname: "",
        registration: "valid_registration",
        active: true
      }
      const response = await request(app.getHttpServer()).post('/company/create').send(JSON.stringify(dto))
      expect(response.status).toEqual(400)
    })
    test('should return 400 if registration was not provided', async () => {
       const dto: CreateCompanyDto = {
        name: `${randomUUID()+"valid_company"}`,
        nickname: "valid_nickname_company",
        registration: "",
        active: true
      }
      const response = await request(app.getHttpServer()).post('/company/create').send(JSON.stringify(dto))
      expect(response.status).toEqual(400)
    })
    test('should return 400 if active was not provided', async () => {
       const dto: CreateCompanyDto = {
        name: `${randomUUID()+"valid_company"}`,
        nickname: "valid_nickname_company",
        registration: "valid_registration",
        active: null
      }
      const response = await request(app.getHttpServer()).post('/company/create').send(dto)
      expect(response.status).toEqual(400)
    })
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
