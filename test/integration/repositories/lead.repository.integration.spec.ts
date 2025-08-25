import { Repository } from "typeorm";
import { getApp, getDataSource } from "../setup/integration-setup";

// Domain entities
import {
  LeadStatus,
  LeadPriority,
} from "../../../src/leads/domain/types/lead.types";

// Infrastructure
import { Lead as TypeOrmLead } from "../../../src/leads/infrastructure/entities/typeorm-lead.entity";
import { TypeOrmLeadRepository } from "../../../src/leads/infrastructure/repositories/typeorm-lead.repository";

// Related entities
import { User } from "../../../src/users/entities/user.entity";
import { Client } from "../../../src/clients/entities/client.entity";

// Token
import { LEAD_REPOSITORY } from "../../../src/leads/domain/constants/tokens";

// Test helpers
import {
  createTestLead,
  createTestUser,
  createTestClient,
  TestScenarios,
} from "../helpers/test-data.helpers";
import {
  createInvalidStatusData,
  createInvalidPriorityData,
} from "../helpers/test-invalid-data.helpers";
import { DatabaseHelpers } from "../helpers/database.helpers";

// Type for aggregation results
interface AggregationResult {
  status: string;
  count: string;
  avgvalue: string;
  totalvalue: string;
  maxvalue: string;
  minvalue: string;
}

describe("TypeOrmLeadRepository Integration", () => {
  let leadRepository: TypeOrmLeadRepository;
  let typeormLeadRepo: Repository<TypeOrmLead>;
  let userRepo: Repository<User>;
  let clientRepo: Repository<Client>;

  beforeEach(() => {
    const app = getApp();
    const dataSource = getDataSource();

    // Get repository from DI container
    leadRepository = app.get(LEAD_REPOSITORY);

    // Get TypeORM repositories for creating test data
    typeormLeadRepo = dataSource.getRepository(TypeOrmLead);
    userRepo = dataSource.getRepository(User);
    clientRepo = dataSource.getRepository(Client);
  });

  describe("Domain ↔ TypeORM Mapping", () => {
    it("should save and retrieve lead with all fields correctly", async () => {
      const domainLead = createTestLead({
        title: "High Value Lead",
        description: "Important client with big budget",
        status: LeadStatus.OPEN,
        priority: LeadPriority.HIGH,
        estimatedValue: 50000,
        expectedCloseDate: new Date("2024-12-31"),
      });

      const savedLead = await leadRepository.save(domainLead);

      expect(savedLead.id).toBeGreaterThan(0);
      expect(savedLead.title).toBe("High Value Lead");
      expect(savedLead.description).toBe("Important client with big budget");
      expect(savedLead.status).toBe(LeadStatus.OPEN);
      expect(savedLead.priority).toBe(LeadPriority.HIGH);
      expect(savedLead.estimatedValue).toBe(50000);
      expect(savedLead.expectedCloseDate).toEqual(new Date("2024-12-31"));

      // Verify data is actually in DB using DatabaseHelpers
      const dbLead = await DatabaseHelpers.assertEntityExists(
        typeormLeadRepo,
        savedLead.id,
      );
      expect(dbLead.title).toBe("High Value Lead");
      expect(dbLead.status).toBe("open");
      expect(dbLead.priority).toBe("high");
    });

    it("should handle nullable fields correctly", async () => {
      const minimalLead = TestScenarios.minimalLead();

      // Act
      const savedLead = await leadRepository.save(minimalLead);

      // Assert
      expect(savedLead.description).toBeNull();
      expect(savedLead.estimatedValue).toBeUndefined();
      expect(savedLead.expectedCloseDate).toBeUndefined();
      expect(savedLead.assignedUserId).toBeUndefined();
      expect(savedLead.clientId).toBeUndefined();

      // Verify in DB
      const dbLead = await typeormLeadRepo.findOne({
        where: { id: savedLead.id },
      });
      expect(dbLead!.description).toBeNull();
      expect(dbLead!.estimatedValue).toBeNull();
      expect(dbLead!.expectedCloseDate).toBeNull();
      expect(dbLead!.assignedUserId).toBeNull();
      expect(dbLead!.clientId).toBeNull();
    });

    it("should retrieve lead by id correctly", async () => {
      const typeormLead = typeormLeadRepo.create({
        title: "Test Lead",
        description: "Test description",
        status: "qualified",
        priority: "urgent",
        estimatedValue: 25000,
        expectedCloseDate: new Date("2024-06-15"),
        assignedUserId: null,
        clientId: null,
      });
      const savedTypeormLead = await typeormLeadRepo.save(typeormLead);

      // Act
      const foundLead = await leadRepository.findById(savedTypeormLead.id);

      // Assert
      expect(foundLead).toBeDefined();
      expect(foundLead!.id).toBe(savedTypeormLead.id);
      expect(foundLead!.title).toBe("Test Lead");
      expect(foundLead!.description).toBe("Test description");
      expect(foundLead!.status).toBe(LeadStatus.QUALIFIED);
      expect(foundLead!.priority).toBe(LeadPriority.URGENT);
      expect(Number(foundLead!.estimatedValue)).toBe(25000);
      expect(new Date(foundLead!.expectedCloseDate!)).toEqual(
        new Date("2024-06-15"),
      );
    });

    it("should return null for non-existent lead", async () => {
      // Act
      const foundLead = await leadRepository.findById(999999);

      // Assert
      expect(foundLead).toBeNull();
    });
  });

  describe("Database Relationships", () => {
    it("should handle lead-client relationship correctly", async () => {
      const savedClient = await DatabaseHelpers.createAndSave(
        clientRepo,
        createTestClient({
          name: "Test Client",
          email: "test@client.com",
        }),
      );

      // Create lead with client relationship
      const domainLead = createTestLead({
        title: "Client Lead",
        description: "Lead from existing client",
        status: LeadStatus.CONTACTED,
        priority: LeadPriority.MEDIUM,
        estimatedValue: 30000,
        clientId: savedClient.id,
      });

      // Act
      const savedLead = await leadRepository.save(domainLead);

      // Assert - verify relationship is saved
      expect(savedLead.clientId).toBe(savedClient.id);

      // Verify in DB with join
      const dbLeadWithClient = await typeormLeadRepo.findOne({
        where: { id: savedLead.id },
        relations: ["client"],
      });

      expect(dbLeadWithClient!.client).toBeDefined();
      expect(dbLeadWithClient!.client.id).toBe(savedClient.id);
      expect(dbLeadWithClient!.client.name).toBe("Test Client");
    });

    it("should handle lead-user assignment correctly", async () => {
      // Arrange
      const savedUser = await DatabaseHelpers.createAndSave(
        userRepo,
        createTestUser({
          firstName: "Test",
          lastName: "User",
          email: "test@user.com",
        }),
      );

      // Create lead with user assignment
      const domainLead = createTestLead({
        title: "Assigned Lead",
        description: "Lead assigned to user",
        status: LeadStatus.PROPOSAL,
        priority: LeadPriority.HIGH,
        estimatedValue: 75000,
        assignedUserId: savedUser.id,
      });

      // Act
      const savedLead = await leadRepository.save(domainLead);

      // Assert
      expect(savedLead.assignedUserId).toBe(savedUser.id);

      // Verify in DB with join
      const dbLeadWithUser = await typeormLeadRepo.findOne({
        where: { id: savedLead.id },
        relations: ["assignedUser"],
      });

      expect(dbLeadWithUser!.assignedUser).toBeDefined();
      expect(dbLeadWithUser!.assignedUser.id).toBe(savedUser.id);
      expect(dbLeadWithUser!.assignedUser.firstName).toBe("Test");
      expect(dbLeadWithUser!.assignedUser.lastName).toBe("User");
    });
  });

  describe("Database Constraints & Validation", () => {
    it("should enforce enum constraints on status", async () => {
      // Arrange - use typed helper for invalid data
      const invalidLeadData = createInvalidStatusData("invalid_status");
      // Explicitly cast to any for intentional type violation in validation test
      const invalidLead = typeormLeadRepo.create(invalidLeadData);

      // Act & Assert - should throw error
      await expect(typeormLeadRepo.save(invalidLead)).rejects.toThrow();
    });

    it("should enforce enum constraints on priority", async () => {
      // Arrange - use typed helper for invalid data
      const invalidLeadData = createInvalidPriorityData("super_urgent");
      // Explicitly cast to any for intentional type violation in validation test
      const invalidLead = typeormLeadRepo.create(invalidLeadData as any);

      // Act & Assert - should throw error
      await expect(typeormLeadRepo.save(invalidLead)).rejects.toThrow();
    });

    it("should handle foreign key constraint for non-existent client", async () => {
      // Arrange
      const leadWithInvalidClient = typeormLeadRepo.create({
        title: "Invalid Client Lead",
        status: "open",
        priority: "medium",
        clientId: 999999, // non-existent client
      });

      // Act & Assert - должна быть ошибка FK constraint
      await expect(
        typeormLeadRepo.save(leadWithInvalidClient),
      ).rejects.toThrow();
    });

    it("should handle foreign key constraint for non-existent user", async () => {
      // Arrange
      const leadWithInvalidUser = typeormLeadRepo.create({
        title: "Invalid User Lead",
        status: "open",
        priority: "medium",
        assignedUserId: 999999, // non-existent user
      });

      // Act & Assert
      await expect(typeormLeadRepo.save(leadWithInvalidUser)).rejects.toThrow();
    });
  });

  describe("CRUD Operations", () => {
    it("should find all leads correctly", async () => {
      // Arrange - создаем несколько leads
      const leads = [
        typeormLeadRepo.create({
          title: "Lead 1",
          status: "open",
          priority: "high",
          estimatedValue: 10000,
        }),
        typeormLeadRepo.create({
          title: "Lead 2",
          status: "contacted",
          priority: "medium",
          estimatedValue: 20000,
        }),
        typeormLeadRepo.create({
          title: "Lead 3",
          status: "qualified",
          priority: "low",
          estimatedValue: 5000,
        }),
      ];
      await typeormLeadRepo.save(leads);

      // Act
      const allLeads = await leadRepository.findAll();

      // Assert
      expect(allLeads).toHaveLength(3);
      expect(allLeads.map((l) => l.title)).toContain("Lead 1");
      expect(allLeads.map((l) => l.title)).toContain("Lead 2");
      expect(allLeads.map((l) => l.title)).toContain("Lead 3");
    });

    it("should delete lead correctly", async () => {
      // Arrange
      const lead = typeormLeadRepo.create({
        title: "Lead to Delete",
        status: "open",
        priority: "medium",
      });
      const savedLead = await typeormLeadRepo.save(lead);

      // Act
      await leadRepository.delete(savedLead.id);

      // Assert - lead должен быть удален (используем DatabaseHelpers)
      await DatabaseHelpers.assertEntityNotExists(
        typeormLeadRepo,
        savedLead.id,
      );

      // Verify through repository
      const foundLead = await leadRepository.findById(savedLead.id);
      expect(foundLead).toBeNull();
    });
  });

  describe("Database Indexes Performance", () => {
    it("should efficiently query by status (indexed field)", async () => {
      // Arrange
      const leads = Array.from({ length: 100 }, (_, i) =>
        typeormLeadRepo.create({
          title: `Lead ${i}`,
          status: i % 2 === 0 ? "open" : "qualified",
          priority: "medium",
          estimatedValue: 1000 * i,
        }),
      );
      await typeormLeadRepo.save(leads);

      // Act
      const startTime = Date.now();
      const openLeads = await typeormLeadRepo.find({
        where: { status: "open" },
      });
      const queryTime = Date.now() - startTime;

      // Assert
      expect(openLeads).toHaveLength(50); // half of leads
      expect(queryTime).toBeLessThan(100);
    });

    it("should efficiently query by priority (indexed field)", async () => {
      // Arrange
      const leads = Array.from({ length: 50 }, (_, i) =>
        typeormLeadRepo.create({
          title: `Priority Lead ${i}`,
          status: "open",
          priority: i < 10 ? "high" : i < 30 ? "medium" : "low",
          estimatedValue: 5000,
        }),
      );
      await typeormLeadRepo.save(leads);

      // Act
      const highPriorityLeads = await typeormLeadRepo.find({
        where: { priority: "high" },
      });

      // Assert
      expect(highPriorityLeads).toHaveLength(10);
      expect(highPriorityLeads.every((lead) => lead.priority === "high")).toBe(
        true,
      );
    });
  });

  describe("Complex Queries & Aggregations", () => {
    it("should handle complex queries with joins and conditions", async () => {
      // Arrange
      const client = await DatabaseHelpers.createAndSave(
        clientRepo,
        createTestClient({
          name: "Premium Client",
          email: "premium@client.com",
        }),
      );

      const user = await DatabaseHelpers.createAndSave(
        userRepo,
        createTestUser({
          firstName: "Sales",
          lastName: "Rep",
          email: "sales@company.com",
        }),
      );

      const leads = [
        typeormLeadRepo.create({
          title: "High Value Lead",
          status: "qualified",
          priority: "high",
          estimatedValue: 100000,
          clientId: client.id,
          assignedUserId: user.id,
        }),
        typeormLeadRepo.create({
          title: "Medium Value Lead",
          status: "contacted",
          priority: "medium",
          estimatedValue: 50000,
          clientId: client.id,
        }),
        typeormLeadRepo.create({
          title: "Low Value Lead",
          status: "open",
          priority: "low",
          estimatedValue: 10000,
        }),
      ];
      await typeormLeadRepo.save(leads);

      // Act
      const highValueLeadsWithClient = await typeormLeadRepo
        .createQueryBuilder("lead")
        .leftJoinAndSelect("lead.client", "client")
        .leftJoinAndSelect("lead.assignedUser", "user")
        .where("lead.estimatedValue > :value", { value: 25000 })
        .andWhere("lead.status IN (:...statuses)", {
          statuses: ["qualified", "contacted"],
        })
        .orderBy("lead.estimatedValue", "DESC")
        .getMany();

      // Assert
      expect(highValueLeadsWithClient).toHaveLength(2);
      expect(Number(highValueLeadsWithClient[0].estimatedValue)).toBe(100000);
      expect(highValueLeadsWithClient[0].client).toBeDefined();
      expect(highValueLeadsWithClient[0].client.name).toBe("Premium Client");
      expect(highValueLeadsWithClient[0].assignedUser).toBeDefined();
      expect(highValueLeadsWithClient[0].assignedUser.firstName).toBe("Sales");
      expect(highValueLeadsWithClient[0].assignedUser.lastName).toBe("Rep");
    });

    it("should handle aggregation queries", async () => {
      // Arrange
      const leads = [
        { estimatedValue: 100000, status: "qualified" },
        { estimatedValue: 50000, status: "qualified" },
        { estimatedValue: 25000, status: "contacted" },
        { estimatedValue: 10000, status: "open" },
      ].map((data) =>
        typeormLeadRepo.create({
          title: `Lead ${data.estimatedValue}`,
          status: data.status,
          priority: "medium",
          estimatedValue: data.estimatedValue,
        }),
      );
      await typeormLeadRepo.save(leads);

      // Act
      const rawStats = await typeormLeadRepo
        .createQueryBuilder("lead")
        .select([
          "lead.status as status",
          "COUNT(lead.id) as count",
          "AVG(lead.estimatedValue) as avgValue",
          "SUM(lead.estimatedValue) as totalValue",
          "MAX(lead.estimatedValue) as maxValue",
          "MIN(lead.estimatedValue) as minValue",
        ])
        .groupBy("lead.status")
        .orderBy("totalValue", "DESC")
        .getRawMany();

      // Type-safe conversion from raw results
      const stats = rawStats as AggregationResult[];

      // Assert
      expect(stats).toHaveLength(3); // 3 different statuses

      const qualifiedStats = stats.find((s) => s.status === "qualified");
      expect(qualifiedStats).toBeDefined();
      expect(parseInt(qualifiedStats!.count)).toBe(2);
      expect(parseFloat(qualifiedStats!.avgvalue)).toBe(75000); // PostgreSQL returns in lowercase
      expect(parseFloat(qualifiedStats!.totalvalue)).toBe(150000);
      expect(parseFloat(qualifiedStats!.maxvalue)).toBe(100000);
      expect(parseFloat(qualifiedStats!.minvalue)).toBe(50000);
    });
  });
});
