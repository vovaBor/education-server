import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCrmTables1754554287971 implements MigrationInterface {
    name = 'CreateCrmTables1754554287971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invoice_items" ("id" SERIAL NOT NULL, "invoiceId" integer NOT NULL, "description" character varying(255) NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "unitPrice" numeric(10,2) NOT NULL, "total" numeric(12,2) NOT NULL, "sku" character varying(100), CONSTRAINT "PK_53b99f9e0e2945e69de1a12b75a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7fb6895fc8fad9f5200e91abb5" ON "invoice_items" ("invoiceId") `);
        await queryRunner.query(`CREATE TYPE "public"."payments_paymentmethod_enum" AS ENUM('cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'completed', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" SERIAL NOT NULL, "invoiceId" integer NOT NULL, "amount" numeric(12,2) NOT NULL, "paymentDate" date NOT NULL, "paymentMethod" "public"."payments_paymentmethod_enum" NOT NULL DEFAULT 'other', "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', "transactionId" character varying(255), "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_32b41cdb985a296213e9a928b5" ON "payments" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_401cbc3402dbd4d592c82365d7" ON "payments" ("paymentMethod") `);
        await queryRunner.query(`CREATE INDEX "IDX_27faf14e8959f0e40d7b722dc0" ON "payments" ("paymentDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_43d19956aeab008b49e0804c14" ON "payments" ("invoiceId") `);
        await queryRunner.query(`CREATE TYPE "public"."invoices_status_enum" AS ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "invoices" ("id" SERIAL NOT NULL, "invoiceNumber" character varying(50) NOT NULL, "clientId" integer NOT NULL, "issueDate" date NOT NULL, "dueDate" date NOT NULL, "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'draft', "subtotal" numeric(12,2) NOT NULL DEFAULT '0', "taxRate" numeric(5,2) NOT NULL DEFAULT '0', "taxAmount" numeric(12,2) NOT NULL DEFAULT '0', "total" numeric(12,2) NOT NULL DEFAULT '0', "paidAmount" numeric(12,2) NOT NULL DEFAULT '0', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_bf8e0f9dd4558ef209ec111782d" UNIQUE ("invoiceNumber"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_559333e87dd4e0f4df6dda4453" ON "invoices" ("status", "dueDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_41ee6a6636d48aac700fb52e0b" ON "invoices" ("dueDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_b408f58f731372f77dc713acc4" ON "invoices" ("issueDate") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bf8e0f9dd4558ef209ec111782" ON "invoices" ("invoiceNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_d9df936180710f9968da7cf4a5" ON "invoices" ("clientId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ac0f09364e3701d9ed35435288" ON "invoices" ("status") `);
        await queryRunner.query(`CREATE TYPE "public"."leads_status_enum" AS ENUM('open', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')`);
        await queryRunner.query(`CREATE TYPE "public"."leads_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`);
        await queryRunner.query(`CREATE TABLE "leads" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "description" text, "status" "public"."leads_status_enum" NOT NULL DEFAULT 'open', "priority" "public"."leads_priority_enum" NOT NULL DEFAULT 'medium', "estimatedValue" numeric(12,2), "expectedCloseDate" date, "assignedUserId" integer, "clientId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cfbbd1d9c7b9fb83b4ccbf4c0d" ON "leads" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_4d098120d1bcd919c17cc3e2eb" ON "leads" ("clientId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f7a7e8a6161a77f330a0aa36ee" ON "leads" ("assignedUserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fabd6d0aaab03f2b349b32ea06" ON "leads" ("priority") `);
        await queryRunner.query(`CREATE INDEX "IDX_491b018d616822bd64ce7d4726" ON "leads" ("status") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "role" character varying(50), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9b83803f5624b6f6b23db8151c" ON "users" ("firstName", "lastName") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_clients_email"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "email" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_b48860677afe62cd96e12659482" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "phone" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "company"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "company" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."clients_status_enum" AS ENUM('prospect', 'active', 'inactive', 'archived')`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "status" "public"."clients_status_enum" NOT NULL DEFAULT 'prospect'`);
        await queryRunner.query(`CREATE INDEX "IDX_8468e296bc86338b10e1db1a77" ON "clients" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_99e921caf21faa2aab020476e4" ON "clients" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b48860677afe62cd96e1265948" ON "clients" ("email") `);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_7fb6895fc8fad9f5200e91abb59" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_43d19956aeab008b49e0804c145" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_d9df936180710f9968da7cf4a51" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_f7a7e8a6161a77f330a0aa36eec" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_4d098120d1bcd919c17cc3e2ebd" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_4d098120d1bcd919c17cc3e2ebd"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_f7a7e8a6161a77f330a0aa36eec"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_d9df936180710f9968da7cf4a51"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_43d19956aeab008b49e0804c145"`);
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_7fb6895fc8fad9f5200e91abb59"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b48860677afe62cd96e1265948"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99e921caf21faa2aab020476e4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8468e296bc86338b10e1db1a77"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."clients_status_enum"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "status" character varying NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "company"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "company" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_b48860677afe62cd96e12659482"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_clients_email" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b83803f5624b6f6b23db8151c"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_491b018d616822bd64ce7d4726"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fabd6d0aaab03f2b349b32ea06"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7a7e8a6161a77f330a0aa36ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d098120d1bcd919c17cc3e2eb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cfbbd1d9c7b9fb83b4ccbf4c0d"`);
        await queryRunner.query(`DROP TABLE "leads"`);
        await queryRunner.query(`DROP TYPE "public"."leads_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."leads_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ac0f09364e3701d9ed35435288"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d9df936180710f9968da7cf4a5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bf8e0f9dd4558ef209ec111782"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b408f58f731372f77dc713acc4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_41ee6a6636d48aac700fb52e0b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_559333e87dd4e0f4df6dda4453"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_43d19956aeab008b49e0804c14"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_27faf14e8959f0e40d7b722dc0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_401cbc3402dbd4d592c82365d7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32b41cdb985a296213e9a928b5"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_paymentmethod_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7fb6895fc8fad9f5200e91abb5"`);
        await queryRunner.query(`DROP TABLE "invoice_items"`);
    }

}
