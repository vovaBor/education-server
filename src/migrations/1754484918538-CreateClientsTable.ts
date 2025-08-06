import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClientsTable1754484918538 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "clients" (
                "id" SERIAL NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "phone" character varying,
                "company" character varying,
                "address" character varying,
                "notes" text,
                "status" character varying NOT NULL DEFAULT 'active',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_clients_email" UNIQUE ("email"),
                CONSTRAINT "PK_clients" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "clients"`);
    }

}
