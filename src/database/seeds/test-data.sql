-- Corrected test data for CRM system analytics using camelCase column names
-- This script creates sample data to demonstrate complex SQL queries

-- Insert test users
INSERT INTO users ("firstName", "lastName", email, role, "isActive", "createdAt", "updatedAt") VALUES
('John', 'Doe', 'john.doe@company.com', 'sales_manager', true, NOW() - INTERVAL '6 months', NOW()),
('Jane', 'Smith', 'jane.smith@company.com', 'sales_rep', true, NOW() - INTERVAL '4 months', NOW()),
('Mike', 'Johnson', 'mike.johnson@company.com', 'sales_rep', true, NOW() - INTERVAL '3 months', NOW()),
('Sarah', 'Williams', 'sarah.williams@company.com', 'account_manager', true, NOW() - INTERVAL '2 months', NOW()),
('David', 'Brown', 'david.brown@company.com', 'sales_rep', false, NOW() - INTERVAL '1 month', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert test clients
INSERT INTO clients (name, email, phone, company, status, notes, "createdAt", "updatedAt") VALUES
('Acme Corporation', 'contact@acme.com', '+1-555-0101', 'Acme Corp', 'active', 'Large enterprise client', NOW() - INTERVAL '5 months', NOW()),
('TechStart Inc', 'info@techstart.com', '+1-555-0102', 'TechStart', 'active', 'Growing startup', NOW() - INTERVAL '4 months', NOW()),
('Global Solutions', 'hello@globalsol.com', '+1-555-0103', 'Global Sol', 'prospect', 'Potential big client', NOW() - INTERVAL '3 months', NOW()),
('Small Business Co', 'admin@smallbiz.com', '+1-555-0104', 'SmallBiz', 'active', 'Regular small client', NOW() - INTERVAL '2 months', NOW()),
('Enterprise Giant', 'procurement@entgiant.com', '+1-555-0105', 'EntGiant', 'active', 'Largest client', NOW() - INTERVAL '6 months', NOW()),
('Inactive Client', 'old@inactive.com', '+1-555-0106', 'Inactive Co', 'inactive', 'No longer active', NOW() - INTERVAL '8 months', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert test leads
INSERT INTO leads (title, description, status, priority, "estimatedValue", "expectedCloseDate", "assignedUserId", "clientId", "createdAt", "updatedAt") VALUES
('Software Implementation', 'CRM software implementation project', 'open', 'high', 50000.00, CURRENT_DATE + INTERVAL '30 days', 1, 1, NOW() - INTERVAL '2 weeks', NOW()),
('Consulting Services', 'IT consulting engagement', 'contacted', 'medium', 25000.00, CURRENT_DATE + INTERVAL '45 days', 2, 2, NOW() - INTERVAL '1 week', NOW()),
('Enterprise License', 'Software licensing deal', 'qualified', 'urgent', 100000.00, CURRENT_DATE + INTERVAL '15 days', 1, 5, NOW() - INTERVAL '3 days', NOW()),
('Training Program', 'Employee training services', 'proposal', 'low', 15000.00, CURRENT_DATE + INTERVAL '60 days', 3, 3, NOW() - INTERVAL '5 days', NOW()),
('Maintenance Contract', 'Annual maintenance agreement', 'negotiation', 'medium', 30000.00, CURRENT_DATE + INTERVAL '20 days', 2, 1, NOW() - INTERVAL '1 day', NOW()),
('Cloud Migration', 'Cloud infrastructure migration', 'won', 'high', 75000.00, CURRENT_DATE - INTERVAL '10 days', 4, 4, NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 week'),
('Security Audit', 'Cybersecurity assessment', 'lost', 'medium', 20000.00, CURRENT_DATE - INTERVAL '5 days', 3, 3, NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '1 week'),
('Data Analytics', 'Business intelligence solution', 'open', 'urgent', 80000.00, CURRENT_DATE - INTERVAL '5 days', 1, 5, NOW() - INTERVAL '1 month', NOW()),
('Mobile App', 'Custom mobile application', 'contacted', 'high', 60000.00, CURRENT_DATE + INTERVAL '90 days', 2, 2, NOW() - INTERVAL '10 days', NOW());

-- Insert test invoices  
INSERT INTO invoices ("invoiceNumber", "clientId", "issueDate", "dueDate", status, subtotal, "taxRate", "taxAmount", total, "paidAmount", notes, "createdAt", "updatedAt") VALUES
('INV-2024-001', 1, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '30 days', 'paid', 45000.00, 8.50, 3825.00, 48825.00, 48825.00, 'Consulting project payment', NOW() - INTERVAL '60 days', NOW()),
('INV-2024-002', 2, CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '15 days', 'paid', 22000.00, 8.50, 1870.00, 23870.00, 23870.00, 'Software licensing', NOW() - INTERVAL '45 days', NOW()),
('INV-2024-003', 5, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '60 days', 'paid', 120000.00, 8.50, 10200.00, 130200.00, 130200.00, 'Enterprise implementation', NOW() - INTERVAL '90 days', NOW()),
('INV-2024-004', 4, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, 'sent', 18000.00, 8.50, 1530.00, 19530.00, 0.00, 'Monthly services', NOW() - INTERVAL '30 days', NOW()),
('INV-2024-005', 3, CURRENT_DATE - INTERVAL '75 days', CURRENT_DATE - INTERVAL '45 days', 'overdue', 35000.00, 8.50, 2975.00, 37975.00, 15000.00, 'Partial payment received', NOW() - INTERVAL '75 days', NOW()),
('INV-2024-006', 1, CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE - INTERVAL '90 days', 'overdue', 25000.00, 8.50, 2125.00, 27125.00, 0.00, 'Long overdue invoice', NOW() - INTERVAL '120 days', NOW()),
('INV-2024-007', 5, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'sent', 95000.00, 8.50, 8075.00, 103075.00, 0.00, 'Current invoice', NOW() - INTERVAL '15 days', NOW()),
('INV-2024-008', 2, CURRENT_DATE - INTERVAL '200 days', CURRENT_DATE - INTERVAL '170 days', 'overdue', 12000.00, 8.50, 1020.00, 13020.00, 5000.00, 'Very old invoice', NOW() - INTERVAL '200 days', NOW());

-- Insert invoice items
INSERT INTO invoice_items ("invoiceId", description, quantity, "unitPrice", total, sku) VALUES
(1, 'Consulting Hours', 300, 150.00, 45000.00, 'CONS-HOUR'),
(2, 'Software License - Standard', 10, 2200.00, 22000.00, 'SW-LIC-STD'),
(3, 'Enterprise Implementation', 1, 120000.00, 120000.00, 'ENT-IMPL'),
(4, 'Monthly Support', 1, 18000.00, 18000.00, 'SUPP-MONTH'),
(5, 'Custom Development', 200, 175.00, 35000.00, 'CUST-DEV'),
(6, 'Training Services', 50, 500.00, 25000.00, 'TRAIN-SVC'),
(7, 'Cloud Infrastructure', 1, 95000.00, 95000.00, 'CLOUD-INF'),
(8, 'Legacy System Migration', 1, 12000.00, 12000.00, 'LEG-MIG');

-- Insert test payments
INSERT INTO payments ("invoiceId", amount, "paymentDate", "paymentMethod", status, "transactionId", notes, "createdAt", "updatedAt") VALUES
(1, 48825.00, CURRENT_DATE - INTERVAL '25 days', 'bank_transfer', 'completed', 'TXN-001-2024', 'Full payment received', NOW() - INTERVAL '25 days', NOW()),
(2, 23870.00, CURRENT_DATE - INTERVAL '10 days', 'credit_card', 'completed', 'TXN-002-2024', 'Credit card payment', NOW() - INTERVAL '10 days', NOW()),
(3, 130200.00, CURRENT_DATE - INTERVAL '55 days', 'bank_transfer', 'completed', 'TXN-003-2024', 'Wire transfer', NOW() - INTERVAL '55 days', NOW()),
(5, 15000.00, CURRENT_DATE - INTERVAL '40 days', 'check', 'completed', 'CHK-001-2024', 'Partial payment by check', NOW() - INTERVAL '40 days', NOW()),
(8, 5000.00, CURRENT_DATE - INTERVAL '165 days', 'bank_transfer', 'completed', 'TXN-004-2024', 'Partial payment', NOW() - INTERVAL '165 days', NOW());

-- Additional sample data for better analytics
INSERT INTO leads (title, description, status, priority, "estimatedValue", "expectedCloseDate", "assignedUserId", "clientId", "createdAt", "updatedAt") VALUES
('System Upgrade', 'Legacy system modernization', 'open', 'medium', 40000.00, CURRENT_DATE - INTERVAL '10 days', 2, 1, NOW() - INTERVAL '6 weeks', NOW()),
('Integration Project', 'Third-party system integration', 'open', 'high', 55000.00, CURRENT_DATE - INTERVAL '2 days', 3, 3, NOW() - INTERVAL '3 weeks', NOW()),
('Performance Optimization', 'Database performance tuning', 'contacted', 'low', 18000.00, CURRENT_DATE + INTERVAL '30 days', 4, 4, NOW() - INTERVAL '1 week', NOW());

-- Update some invoice statuses to overdue based on due dates
UPDATE invoices 
SET status = 'overdue' 
WHERE "dueDate" < CURRENT_DATE AND status IN ('sent') AND (total - "paidAmount") > 0; 