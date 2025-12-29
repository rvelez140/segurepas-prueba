# Tests - SecurePass API

## Estructura de Tests

```
tests/
├── unit/              # Tests unitarios
│   ├── logger.test.ts
│   ├── validation.test.ts
│   └── ...
├── integration/       # Tests de integración
│   ├── health.test.ts
│   ├── auth.test.ts
│   └── ...
├── e2e/              # Tests end-to-end (futuro)
├── setup.ts          # Configuración global
└── clear.ts          # Limpieza de BD de test
```

## Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Tests para CI
npm run test:ci
```

## Escribir Nuevos Tests

### Test Unitario Example

```typescript
import { myFunction } from '../../src/utils/myFunction';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Test de Integración Example

```typescript
import request from 'supertest';
import app from '../../src/app';

describe('POST /api/endpoint', () => {
  it('should create resource', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

## Cobertura de Tests

### Objetivo
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Estado Actual
Ver `npm run test:coverage` para el estado actual.

## Mejores Prácticas

1. **Nombres descriptivos**: Usa descripciones claras de lo que se está probando
2. **Arrange-Act-Assert**: Estructura tus tests en 3 secciones
3. **Un concepto por test**: Cada test debe verificar una sola cosa
4. **Mocks apropiados**: Mockea dependencias externas (DB, APIs, etc.)
5. **Tests independientes**: Cada test debe poder ejecutarse solo

## Configuración de Cobertura

La configuración está en `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
},
```

## Tips

- Usa `beforeEach` para configuración común
- Usa `afterEach` para limpieza
- Mockea servicios externos
- No testees implementaciones internas
- Testea casos extremos y errores
