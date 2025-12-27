# Contributing to SecurePass

Thank you for your interest in contributing to SecurePass! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to the Contributor Covenant Code of Conduct. By participating, you are expected to uphold this code. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18+)
- **npm** (v9+)
- **Git**
- **MongoDB** (v7+)
- **Redis** (v7+)
- **Docker** (optional, but recommended)

### Development Setup

1. **Fork the repository**

   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/segurepas-prueba.git
   cd segurepas-prueba
   ```

3. **Run the automated setup script**

   ```bash
   ./scripts/dev-setup.sh
   ```

   This script will:
   - Install all dependencies
   - Create environment files
   - Set up Git hooks
   - Configure the development environment

4. **Configure environment variables**

   Edit the `.env` files in each app directory:
   - `apps/api/.env`
   - `apps/web/.env`
   - `apps/mobile/.env`

5. **Start MongoDB and Redis**

   Using Docker:
   ```bash
   docker run -d -p 27017:27017 --name mongo mongo:7
   docker run -d -p 6379:6379 --name redis redis:7-alpine
   ```

   Or use your local installations.

6. **Start the development servers**

   ```bash
   npm run start:all
   ```

## Development Workflow

### Creating a Branch

Always create a new branch for your work:

```bash
git checkout -b type/short-description
```

Branch naming conventions:
- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Adding or updating tests
- `chore/description` - Maintenance tasks

Example:
```bash
git checkout -b feat/add-user-notifications
```

### Making Changes

1. **Write clean, readable code** following our [coding standards](#coding-standards)

2. **Test your changes**
   ```bash
   npm run test:all
   ```

3. **Lint and format your code**
   ```bash
   npm run lint:fix
   npm run format
   ```

4. **Run the application** to verify everything works
   ```bash
   npm run start:all
   ```

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependencies
- `ci`: CI/CD changes
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Scopes

- `api` - Backend API
- `web` - Web application
- `mobile` - Mobile application
- `desktop` - Desktop application
- `docker` - Docker configuration
- `ci` - CI/CD pipeline
- `deps` - Dependencies
- `auth` - Authentication
- `db` - Database
- `security` - Security improvements
- `logging` - Logging
- `monitoring` - Monitoring
- `docs` - Documentation
- `tests` - Tests

### Examples

```bash
feat(api): add user notification system
fix(web): resolve login redirect issue
docs(readme): update installation instructions
refactor(api): simplify authentication logic
test(web): add unit tests for user component
```

### Commitlint

Your commits will be automatically validated by commitlint. If a commit message doesn't follow the convention, the commit will be rejected.

## Pull Request Process

### Before Submitting

1. **Update your fork** with the latest changes from the main repository:
   ```bash
   git remote add upstream https://github.com/rvelez140/segurepas-prueba.git
   git fetch upstream
   git merge upstream/main
   ```

2. **Run all tests**
   ```bash
   npm run test:all
   ```

3. **Run linting and formatting**
   ```bash
   npm run lint
   npm run format:check
   ```

4. **Build all applications**
   ```bash
   cd apps/api && npm run build
   cd ../web && npm run build
   cd ../desktop && npm run build
   ```

### Submitting a Pull Request

1. **Push your changes** to your fork:
   ```bash
   git push origin your-branch-name
   ```

2. **Create a Pull Request** on GitHub

3. **Fill out the PR template** with:
   - Clear description of changes
   - Related issue numbers (if applicable)
   - Screenshots (for UI changes)
   - Testing performed
   - Checklist completion

4. **Wait for review**
   - Address any review comments
   - Keep your PR up to date with the main branch
   - Be responsive to feedback

### PR Requirements

Your PR must:

- ✅ Pass all CI/CD checks
- ✅ Have clear, descriptive commits following Conventional Commits
- ✅ Include tests for new features or bug fixes
- ✅ Update documentation if needed
- ✅ Not decrease overall test coverage
- ✅ Follow the project's coding standards
- ✅ Be reviewed and approved by at least one maintainer

## Coding Standards

### General Principles

- **Write clean, readable code** - Code is read more often than it's written
- **Keep it simple** - Avoid over-engineering
- **Follow DRY** - Don't Repeat Yourself
- **SOLID principles** - Apply where appropriate
- **Comment complex logic** - Explain the "why", not the "what"

### TypeScript/JavaScript

- Use **TypeScript** for type safety
- Follow **ESLint** rules (configured in `eslint.config.js`)
- Use **Prettier** for formatting (configured in `.prettierrc.json`)
- Prefer **const** over **let**, avoid **var**
- Use **arrow functions** for callbacks
- Use **async/await** over promises chains
- Use **meaningful variable names**

Example:
```typescript
// ✅ Good
const getUserById = async (id: string): Promise<User> => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// ❌ Bad
var getUser = function (i) {
  return User.findById(i).then(u => u);
};
```

### React

- Use **functional components** with hooks
- Use **TypeScript** for props and state
- Keep components **small and focused**
- Use **custom hooks** for reusable logic
- Prefer **composition** over inheritance

Example:
```tsx
// ✅ Good
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user)}>Edit</button>
    </div>
  );
};
```

### File Organization

- **One component per file**
- **Group related files** in directories
- **Use index files** for public exports
- **Keep utilities separate** from business logic

```
src/
├── components/        # Reusable UI components
├── pages/             # Page components
├── services/          # Business logic
├── utils/             # Utility functions
├── types/             # TypeScript types/interfaces
├── hooks/             # Custom React hooks
└── contexts/          # React contexts
```

## Testing Guidelines

### Test Coverage

Maintain **minimum 50% coverage** for:
- Statements
- Branches
- Functions
- Lines

### Writing Tests

1. **Unit Tests**
   - Test individual functions/components
   - Mock external dependencies
   - Test edge cases

2. **Integration Tests**
   - Test interactions between modules
   - Test API endpoints
   - Test database operations

3. **E2E Tests** (coming soon)
   - Test complete user flows
   - Test critical paths

### Test Example

```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when ID is valid', async () => {
      const userId = 'valid-id';
      const mockUser = { id: userId, name: 'John Doe' };

      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const result = await getUserById(userId);

      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      await expect(getUserById('invalid-id')).rejects.toThrow('User not found');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test:all

# Run tests for specific app
npm run test:api
npm run test:web

# Run tests in watch mode
cd apps/api && npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Documentation

### Code Documentation

- Add **JSDoc** comments for public functions
- Document **complex logic**
- Keep comments **up to date**

Example:
```typescript
/**
 * Retrieves a user by their ID
 * @param id - The unique identifier of the user
 * @returns The user object if found
 * @throws {Error} If user is not found
 */
const getUserById = async (id: string): Promise<User> => {
  // implementation
};
```

### Documentation Files

When adding new features, update:

- `README.md` - If it affects installation or basic usage
- `FEATURES.md` - If adding a new feature
- API documentation in code (JSDoc)
- Component documentation (for React components)

### Generating Documentation

```bash
# Generate TypeDoc documentation (coming soon)
npm run docs:generate

# View generated documentation
npm run docs:serve
```

## Questions or Problems?

- **Documentation**: Check the [README.md](README.md) and other docs
- **Issues**: Search existing [issues](https://github.com/rvelez140/segurepas-prueba/issues)
- **New Issue**: Create a [new issue](https://github.com/rvelez140/segurepas-prueba/issues/new)
- **Discussions**: Use [GitHub Discussions](https://github.com/rvelez140/segurepas-prueba/discussions)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to SecurePass! 🎉
