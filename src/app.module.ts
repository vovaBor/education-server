import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { ResendModule } from 'nestjs-resend';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Keycloak imports
import {
  KeycloakConnectModule,
  AuthGuard,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { LeadsModule } from './leads/leads.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auth/auth.module';
import { JitSyncInterceptor } from './auth/interceptors/jit-sync.interceptor';

// Import entities
import { User } from './users/entities/user.entity';
import { Client } from './clients/entities/client.entity';
import { Lead } from './leads/infrastructure/entities/typeorm-lead.entity';
import { Invoice } from './invoices/entities/invoice.entity';
import { InvoiceItem } from './invoices/entities/invoice-item.entity';
import { Payment } from './payments/entities/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Keycloak Configuration
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8080',
      realm: process.env.KEYCLOAK_REALM || 'education-realm',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'education-server',
      secret: process.env.KEYCLOAK_CLIENT_SECRET || 'your-client-secret',
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
    }),
    
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    ResendModule.forRootAsync({
      useFactory: async () => ({
        apiKey: process.env.RESEND_API_KEY || 'your-resend-api-key',
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'crm_user',
      password: process.env.DB_PASSWORD || 'crm_password',
      database: process.env.DB_NAME || 'crm_db',
      entities: [User, Client, Lead, Invoice, InvoiceItem, Payment],
      migrations: ['dist/migrations/*{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development', // 👈 Temporarily enabled for development
      migrationsRun: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    AnalyticsModule,
    UsersModule,
    ClientsModule,
    LeadsModule,
    InvoicesModule,
    PaymentsModule,
    AuthModule,
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: JitSyncInterceptor,
    },
  ],
})
export class AppModule {}
