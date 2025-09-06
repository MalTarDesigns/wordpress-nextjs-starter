@echo off
REM WordPress Next.js Starter - Windows Deployment Script
REM Automates pre-deployment checks and deployment to Vercel

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_NAME=wordpress-next-starter
set REQUIRED_NODE_VERSION=18

:print_header
echo ==================================
echo  WordPress Next.js Deployment
echo ==================================
echo.

:main
set DEPLOYMENT_TYPE=preview
set SKIP_BUILD=false
set SKIP_TESTS=false

REM Parse arguments
:parse_args
if "%1"=="" goto start_deployment
if "%1"=="production" (
    set DEPLOYMENT_TYPE=production
    shift
    goto parse_args
)
if "%1"=="preview" (
    set DEPLOYMENT_TYPE=preview
    shift
    goto parse_args
)
if "%1"=="--skip-build" (
    set SKIP_BUILD=true
    shift
    goto parse_args
)
if "%1"=="--skip-tests" (
    set SKIP_TESTS=true
    shift
    goto parse_args
)
if "%1"=="--help" (
    goto show_usage
)
echo [ERROR] Unknown option: %1
goto show_usage

:start_deployment
call :print_header
echo [INFO] Deploying to: %DEPLOYMENT_TYPE%
echo.

call :check_requirements
call :validate_environment

if "%SKIP_TESTS%"=="false" (
    call :run_tests
)

if "%SKIP_BUILD%"=="false" (
    call :build_project
)

call :deploy_to_vercel
call :check_deployment

echo.
echo [SUCCESS] Deployment completed successfully!
echo.
echo Next Steps:
echo 1. Test your deployed site functionality
echo 2. Configure custom domain if needed
echo 3. Set up monitoring and analytics
echo 4. Configure WordPress webhooks for content updates
echo.
echo For more information, see DEPLOYMENT.md
goto :eof

:check_requirements
echo [STEP] Checking requirements...

REM Check Node.js version
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js %REQUIRED_NODE_VERSION% or higher.
    exit /b 1
)

REM Check pnpm
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pnpm is not installed. Installing pnpm...
    npm install -g pnpm
)

REM Check Vercel CLI
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Vercel CLI not found. Installing...
    npm install -g vercel
)

echo [SUCCESS] All requirements met
goto :eof

:validate_environment
echo [STEP] Validating environment variables...

if not exist ".env.local" if not exist ".env" (
    echo [ERROR] No environment file found. Please create .env.local or .env file.
    echo [INFO] Copy .env.vercel.example to .env.local and configure your variables.
    exit /b 1
)

REM Run environment validation
npm run validate-env >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Environment validation failed. Please check your environment variables.
    echo [INFO] Run 'npm run validate-env' to see detailed errors.
    exit /b 1
)

echo [SUCCESS] Environment validation passed
goto :eof

:run_tests
echo [STEP] Running pre-deployment checks...

echo [INFO] Running TypeScript type checking...
npm run type-check
if errorlevel 1 (
    echo [ERROR] TypeScript type checking failed
    exit /b 1
)

echo [INFO] Running ESLint...
npm run lint:strict
if errorlevel 1 (
    echo [ERROR] ESLint checks failed
    exit /b 1
)

echo [SUCCESS] All checks passed
goto :eof

:build_project
echo [STEP] Building project...

echo [INFO] Cleaning previous builds...
npm run clean

echo [INFO] Installing dependencies...
pnpm install --frozen-lockfile

echo [INFO] Building production bundle...
npm run build:production
if errorlevel 1 (
    echo [ERROR] Build failed
    exit /b 1
)

echo [SUCCESS] Build completed successfully
goto :eof

:deploy_to_vercel
echo [STEP] Deploying to Vercel...

if not exist ".vercel\project.json" (
    echo [INFO] First time deployment detected
    echo [INFO] You will be prompted to configure your project
)

if "%DEPLOYMENT_TYPE%"=="production" (
    echo [INFO] Deploying to production...
    vercel --prod
) else (
    echo [INFO] Deploying to preview...
    vercel
)
goto :eof

:check_deployment
echo [STEP] Checking deployment...

for /f "tokens=2" %%i in ('vercel ls ^| findstr "%PROJECT_NAME%"') do set DEPLOYMENT_URL=%%i

if "%DEPLOYMENT_URL%"=="" (
    echo [ERROR] Could not determine deployment URL
    exit /b 1
)

echo [INFO] Deployment URL: https://%DEPLOYMENT_URL%
echo [INFO] Running health check...

REM Basic health check using curl if available
curl --version >nul 2>&1
if not errorlevel 1 (
    curl -f -s "https://%DEPLOYMENT_URL%" >nul
    if not errorlevel 1 (
        echo [SUCCESS] Deployment is accessible
    ) else (
        echo [ERROR] Deployment health check failed
        exit /b 1
    )
) else (
    echo [INFO] curl not available, skipping health check
)

goto :eof

:show_usage
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   production    Deploy to production environment
echo   preview       Deploy to preview environment (default)
echo   --skip-build  Skip build step (use existing build)
echo   --skip-tests  Skip pre-deployment tests
echo   --help        Show this help message
echo.
echo Examples:
echo   %0                    # Deploy to preview
echo   %0 production         # Deploy to production
echo   %0 --skip-build       # Deploy without rebuilding
goto :eof