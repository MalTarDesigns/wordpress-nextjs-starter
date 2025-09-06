#!/bin/bash

# WordPress Next.js Starter - Deployment Script
# Automates pre-deployment checks and deployment to Vercel

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="wordpress-next-starter"
REQUIRED_NODE_VERSION="18"

print_header() {
    echo -e "${BLUE}"
    echo "=================================="
    echo " WordPress Next.js Deployment"
    echo "=================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${YELLOW}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

check_requirements() {
    print_step "Checking requirements..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js $REQUIRED_NODE_VERSION or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt "$REQUIRED_NODE_VERSION" ]; then
        print_error "Node.js version $NODE_VERSION found. Please upgrade to version $REQUIRED_NODE_VERSION or higher."
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_info "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_success "All requirements met"
}

validate_environment() {
    print_step "Validating environment variables..."
    
    # Check if environment file exists
    if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
        print_error "No environment file found. Please create .env.local or .env file."
        print_info "Copy .env.vercel.example to .env.local and configure your variables."
        exit 1
    fi
    
    # Run environment validation
    if ! npm run validate-env &> /dev/null; then
        print_error "Environment validation failed. Please check your environment variables."
        print_info "Run 'npm run validate-env' to see detailed errors."
        exit 1
    fi
    
    print_success "Environment validation passed"
}

run_tests() {
    print_step "Running pre-deployment checks..."
    
    # Type checking
    print_info "Running TypeScript type checking..."
    if ! npm run type-check; then
        print_error "TypeScript type checking failed"
        exit 1
    fi
    
    # Linting
    print_info "Running ESLint..."
    if ! npm run lint:strict; then
        print_error "ESLint checks failed"
        exit 1
    fi
    
    print_success "All checks passed"
}

build_project() {
    print_step "Building project..."
    
    # Clean previous builds
    print_info "Cleaning previous builds..."
    npm run clean
    
    # Install dependencies
    print_info "Installing dependencies..."
    pnpm install --frozen-lockfile
    
    # Build project
    print_info "Building production bundle..."
    if ! npm run build:production; then
        print_error "Build failed"
        exit 1
    fi
    
    print_success "Build completed successfully"
}

deploy_to_vercel() {
    print_step "Deploying to Vercel..."
    
    # Check if this is first deployment
    if [ ! -f ".vercel/project.json" ]; then
        print_info "First time deployment detected"
        print_info "You will be prompted to configure your project"
    fi
    
    # Deploy
    if [ "$1" = "production" ]; then
        print_info "Deploying to production..."
        vercel --prod
    else
        print_info "Deploying to preview..."
        vercel
    fi
}

check_deployment() {
    print_step "Checking deployment..."
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls | grep "$PROJECT_NAME" | head -1 | awk '{print $2}')
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        print_error "Could not determine deployment URL"
        return 1
    fi
    
    print_info "Deployment URL: https://$DEPLOYMENT_URL"
    
    # Basic health check
    print_info "Running health check..."
    if curl -f -s "https://$DEPLOYMENT_URL" > /dev/null; then
        print_success "Deployment is accessible"
    else
        print_error "Deployment health check failed"
        return 1
    fi
}

cleanup() {
    print_step "Cleaning up..."
    # Add any cleanup tasks here
    print_success "Cleanup completed"
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  production    Deploy to production environment"
    echo "  preview       Deploy to preview environment (default)"
    echo "  --skip-build  Skip build step (use existing build)"
    echo "  --skip-tests  Skip pre-deployment tests"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy to preview"
    echo "  $0 production         # Deploy to production"
    echo "  $0 --skip-build       # Deploy without rebuilding"
}

main() {
    local DEPLOYMENT_TYPE="preview"
    local SKIP_BUILD=false
    local SKIP_TESTS=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            production)
                DEPLOYMENT_TYPE="production"
                shift
                ;;
            preview)
                DEPLOYMENT_TYPE="preview"
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    print_header
    print_info "Deploying to: $DEPLOYMENT_TYPE"
    
    # Run deployment steps
    check_requirements
    validate_environment
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    if [ "$SKIP_BUILD" = false ]; then
        build_project
    fi
    
    deploy_to_vercel "$DEPLOYMENT_TYPE"
    check_deployment
    cleanup
    
    print_success "Deployment completed successfully!"
    
    # Show next steps
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Test your deployed site functionality"
    echo "2. Configure custom domain if needed"
    echo "3. Set up monitoring and analytics"
    echo "4. Configure WordPress webhooks for content updates"
    echo ""
    echo "For more information, see DEPLOYMENT.md"
}

# Trap errors and cleanup
trap cleanup EXIT

# Run main function with all arguments
main "$@"