import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { randomUUID } from 'crypto';

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
      console.log(response)
      expect(response.status).toEqual(200)
    })
  });

  describe('POST /company/create', () => { 
    test('should create a new company', async () => {
      const response = await request(app.getHttpServer()).post('/company/create').send(
        {
          name: `${randomUUID()+"valid_company"}`,
          nickname: "valid_nickname_company",
          registration: "valid_registration",
          active: true
        }
      )
      expect(response.status).toEqual(200)
    })
  })
  
})
