import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Representatives (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let representativeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login para obter token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'douglas@pagluz.com',
        password: 'admin123',
      });
    
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/representatives (POST)', () => {
    it('should create a new representative', () => {
      return request(app.getHttpServer())
        .post('/representatives')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'João Silva',
          email: 'joao.silva@example.com',
          password: 'password123',
          cpfCnpj: '123.456.789-00',
          phone: '(11) 99999-9999',
          city: 'São Paulo',
          state: 'SP',
          commissionRate: 5.0,
          specializations: ['Residencial', 'Comercial'],
          notes: 'Representante experiente',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('João Silva');
          expect(res.body.email).toBe('joao.silva@example.com');
          representativeId = res.body.id;
        });
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/representatives')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Maria Santos',
          email: 'joao.silva@example.com', // Email duplicado
          password: 'password123',
          cpfCnpj: '987.654.321-00',
          phone: '(11) 88888-8888',
          city: 'São Paulo',
          state: 'SP',
        })
        .expect(409);
    });
  });

  describe('/representatives (GET)', () => {
    it('should list all representatives', () => {
      return request(app.getHttpServer())
        .get('/representatives')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/representatives/:id (GET)', () => {
    it('should get representative by id', () => {
      return request(app.getHttpServer())
        .get(`/representatives/${representativeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(representativeId);
          expect(res.body.name).toBe('João Silva');
        });
    });

    it('should return 404 for non-existent representative', () => {
      return request(app.getHttpServer())
        .get('/representatives/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/representatives/:id (PATCH)', () => {
    it('should update representative', () => {
      return request(app.getHttpServer())
        .patch(`/representatives/${representativeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'João Silva Atualizado',
          commissionRate: 7.5,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('João Silva Atualizado');
          expect(res.body.commissionRate).toBe(7.5);
        });
    });
  });

  describe('/representatives/:id (DELETE)', () => {
    it('should delete representative', () => {
      return request(app.getHttpServer())
        .delete(`/representatives/${representativeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
