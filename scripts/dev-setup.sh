#!/bin/bash

# SecurePass Development Environment Setup Script
# This script automates the setup process for new developers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
check_node_version() {
    if ! command_exists node; then
        print_error "Node.js is not installed"
        print_info "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi

    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi

    print_success "Node.js $(node -v) is installed"
}

# Check npm
check_npm() {
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm -v) is installed"
}

# Check Docker
check_docker() {
    if ! command_exists docker; then
        print_warning "Docker is not installed (optional but recommended)"
        print_info "Install from: https://docs.docker.com/get-docker/"
        return 1
    fi
    print_success "Docker is installed"
    return 0
}

# Check Git
check_git() {
    if ! command_exists git; then
        print_error "Git is not installed"
        print_info "Please install Git from https://git-scm.com/"
        exit 1
    fi
    print_success "Git $(git --version | cut -d' ' -f3) is installed"
}

# Install root dependencies
install_root_deps() {
    print_header "Installing root dependencies"
    npm install
    print_success "Root dependencies installed"
}

# Install application dependencies
install_app_deps() {
    local app=$1
    print_info "Installing $app dependencies..."
    cd "apps/$app"
    npm install
    cd ../..
    print_success "$app dependencies installed"
}

# Create environment files
create_env_files() {
    print_header "Creating environment files"

    # API .env
    if [ ! -f apps/api/.env ]; then
        cat > apps/api/.env << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/securepass_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Cloudinary (optional in dev)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional in dev)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password

# Stripe (optional in dev)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal (optional in dev)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Firebase (optional in dev)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Sentry (optional in dev)
SENTRY_DSN=
EOF
        print_success "Created apps/api/.env"
    else
        print_warning "apps/api/.env already exists, skipping"
    fi

    # Web .env
    if [ ! -f apps/web/.env ]; then
        cat > apps/web/.env << 'EOF'
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SENTRY_DSN=
EOF
        print_success "Created apps/web/.env"
    else
        print_warning "apps/web/.env already exists, skipping"
    fi

    # Mobile .env
    if [ ! -f apps/mobile/.env ]; then
        cat > apps/mobile/.env << 'EOF'
API_URL=http://localhost:5000
SENTRY_DSN=
EOF
        print_success "Created apps/mobile/.env"
    else
        print_warning "apps/mobile/.env already exists, skipping"
    fi
}

# Setup Git hooks
setup_git_hooks() {
    print_header "Setting up Git hooks"
    npm run prepare
    print_success "Git hooks configured"
}

# Create logs directory
create_logs_dir() {
    print_header "Creating logs directory"
    mkdir -p apps/api/logs
    print_success "Logs directory created"
}

# Check services status
check_services() {
    print_header "Checking required services"

    # Check MongoDB
    if command_exists mongod; then
        print_success "MongoDB is installed"
    else
        print_warning "MongoDB is not installed"
        print_info "Install from: https://www.mongodb.com/try/download/community"
        print_info "Or run with Docker: docker run -d -p 27017:27017 mongo:7"
    fi

    # Check Redis
    if command_exists redis-server || command_exists redis-cli; then
        print_success "Redis is installed"
    else
        print_warning "Redis is not installed"
        print_info "Install from: https://redis.io/download"
        print_info "Or run with Docker: docker run -d -p 6379:6379 redis:7-alpine"
    fi
}

# Print next steps
print_next_steps() {
    print_header "Setup Complete! 🎉"

    echo ""
    print_info "Next steps:"
    echo ""
    echo "  1. Configure your environment variables in:"
    echo "     - apps/api/.env"
    echo "     - apps/web/.env"
    echo "     - apps/mobile/.env"
    echo ""
    echo "  2. Make sure MongoDB and Redis are running"
    echo ""
    echo "  3. Start the development servers:"
    echo "     npm run start:api     - Start API server (http://localhost:5000)"
    echo "     npm run start:web     - Start Web app (http://localhost:3000)"
    echo "     npm run start:mobile  - Start Mobile app"
    echo "     npm run start:all     - Start all apps concurrently"
    echo ""
    echo "  4. Run tests:"
    echo "     npm run test:all      - Run all tests"
    echo ""
    echo "  5. Code quality:"
    echo "     npm run lint          - Run linter"
    echo "     npm run format        - Format code"
    echo ""
    echo "  6. Open the workspace in VS Code:"
    echo "     code .vscode/securepass.code-workspace"
    echo ""
    print_info "For more information, see README.md"
    echo ""
}

# Main setup function
main() {
    print_header "SecurePass Development Environment Setup"

    # Check prerequisites
    check_git
    check_node_version
    check_npm
    check_docker

    # Install dependencies
    install_root_deps
    install_app_deps "api"
    install_app_deps "web"
    install_app_deps "mobile"
    install_app_deps "desktop"

    # Setup environment
    create_env_files
    create_logs_dir
    setup_git_hooks

    # Check services
    check_services

    # Print next steps
    print_next_steps
}

# Run main function
main
