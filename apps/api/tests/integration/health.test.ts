import request from 'supertest';
import express, { Application } from 'express';
import mongoose from 'mongoose';

// Mock de la aplicación simplificada para testing
const createTestApp = (): Application => {
  const app = express();

  app.get('/health', async (req, res) => {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'test',
      version: '1.0.0',
      services: {
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        api: 'up'
      }
    };

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json(healthcheck);
    }

    res.status(200).json(healthcheck);
  });

  return app;
};

describe('Health Check Endpoint', () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });

  it('should return 200 and health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('services');
  });

  it('should include services status', async () => {
    const response = await request(app).get('/health');

    expect(response.body.services).toHaveProperty('mongodb');
    expect(response.body.services).toHaveProperty('api');
    expect(response.body.services.api).toBe('up');
  });

  it('should have correct environment', async () => {
    const response = await request(app).get('/health');

    expect(response.body.environment).toBe('test');
  });
});
