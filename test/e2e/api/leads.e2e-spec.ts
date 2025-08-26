import { request, getDataSource } from '../setup/minimal-e2e-setup';
import { ApiFixtures } from '../fixtures/api-fixtures';
import { Repository } from 'typeorm';

// Entities for DB verification
import { Lead as TypeOrmLead } from '../../../src/leads/infrastructure/entities/typeorm-lead.entity';
import { Client } from '../../../src/clients/entities/client.entity';
import { User } from '../../../src/users/entities/user.entity';

describe('POST /leads E2E', () => {
  let leadRepo: Repository<TypeOrmLead>;
  let clientRepo: Repository<Client>;
  let userRepo: Repository<User>;

  beforeEach(() => {
    const dataSource = getDataSource();
    leadRepo = dataSource.getRepository(TypeOrmLead);
    clientRepo = dataSource.getRepository(Client);
    userRepo = dataSource.getRepository(User);
  });

  describe('✅ Success Cases', () => {
    it('should create lead with valid data', async () => {
      // Arrange
      const leadData = ApiFixtures.createUniqueLead();

      // Act
      const response = await request()
        .post('/leads')
        .send(leadData)
        .expect(201);

      // Assert Response
      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('created'),
        leadId: expect.any(Number),
      });

            // Assert Database
      const savedLead = await leadRepo.findOne({
        where: { id: response.body.leadId },
      });

      expect(savedLead).toBeDefined();
      expect(savedLead!.title).toBe(leadData.title);
      expect(savedLead!.priority).toBe(leadData.priority);
    });

    it('should create minimal lead with only required fields', async () => {
      // Arrange
      const leadData = {
        ...ApiFixtures.leads.minimalLead,
        title: `Minimal Lead ${Date.now()}`, // Уникальный title
      };

      // Act
      const response = await request()
        .post('/leads')
        .send(leadData)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('created'),
        leadId: expect.any(Number),
      });

      // Assert Database - verify lead was created with correct data
      const savedLead = await leadRepo.findOne({
        where: { id: response.body.leadId },
      });
      
      expect(savedLead).toBeDefined();
      expect(savedLead!.title).toBe(leadData.title);
      expect(savedLead!.priority).toBe(leadData.priority);
    });

    it('should create lead with client relationship', async () => {
      // Arrange - create client
      const clientData = ApiFixtures.createUniqueClient();
      const savedClient = await clientRepo.save(clientRepo.create(clientData));

      const leadData = {
        ...ApiFixtures.createUniqueLead(),
        clientId: savedClient.id,
      };

      // Act
      const response = await request()
        .post('/leads')
        .send(leadData)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('created'),
        leadId: expect.any(Number),
      });

      // Verify relationship in DB
      const savedLead = await leadRepo.findOne({
        where: { id: response.body.leadId },
      });

      expect(savedLead).toBeDefined();
      expect(savedLead!.clientId).toBe(savedClient.id);
    });

    // User assignment happens through separate endpoint PUT /:id/assign
  });

  describe('❌ Validation Error Cases', () => {
    it('should return 400 when title is missing', async () => {
      // Act
      const response = await request()
        .post('/leads')
        .send(ApiFixtures.leads.invalid.missingTitle)
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.arrayContaining([
          expect.stringContaining('title'),
        ]),
        error: 'Bad Request',
      });
    });

    it('should return 400 when priority is invalid', async () => {
      // Act
      const response = await request()
        .post('/leads')
        .send(ApiFixtures.leads.invalid.invalidPriority)
        .expect(400);

      // Assert
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('priority must be one of'),
        ])
      );
    });

    it('should return 400 when estimatedValue is not a number', async () => {
      // Act
      const response = await request()
        .post('/leads')
        .send(ApiFixtures.leads.invalid.invalidEstimatedValue)
        .expect(400);

      // Assert
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('estimatedValue must be a number'),
        ])
      );
    });
  });

  describe('🔧 Edge Cases', () => {
    it('should handle empty request body', async () => {
      // Act
      const response = await request()
        .post('/leads')
        .send({})
        .expect(400);

      // Assert
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('title'),
        ])
      );
    });

    it('should handle malformed JSON', async () => {
      // Act
      const response = await request()
        .post('/leads')
        .send('{"invalid": json}')
        .expect(400);

      // Assert
      expect(response.body.statusCode).toBe(400);
    });

    it('should reject extra fields when whitelist is enabled', async () => {
      // Arrange
      const leadData = {
        ...ApiFixtures.createUniqueLead(),
        extraField: 'should be rejected',
        anotherExtraField: 123,
      };

      // Act
      const response = await request()
        .post('/leads')
        .send(leadData)
        .expect(400);

      // Assert
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('property extraField should not exist'),
        ])
      );
    });
  });
}); 
