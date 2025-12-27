// MongoDB Initialization Script for Development
// Creates database and initial collections

db = db.getSiblingDB('securepass_dev');

// Create collections
db.createCollection('users');
db.createCollection('visits');
db.createCollection('auditlogs');
db.createCollection('payments');
db.createCollection('parkingspaces');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });

db.visits.createIndex({ visitDate: 1 });
db.visits.createIndex({ status: 1 });
db.visits.createIndex({ resident: 1 });
db.visits.createIndex({ visitor: 1 });

db.auditlogs.createIndex({ timestamp: 1 });
db.auditlogs.createIndex({ userId: 1 });
db.auditlogs.createIndex({ action: 1 });
db.auditlogs.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000 } // 90 days TTL
);

db.payments.createIndex({ user: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ createdAt: 1 });

db.parkingspaces.createIndex({ spaceNumber: 1 }, { unique: true });
db.parkingspaces.createIndex({ status: 1 });
db.parkingspaces.createIndex({ assignedTo: 1 });

print('✅ SecurePass development database initialized successfully!');
