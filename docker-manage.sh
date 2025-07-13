#!/bin/bash

# Docker management script for Ainterest app

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if .env.local exists
check_env() {
    if [ ! -f .env.local ]; then
        print_warning ".env.local file not found!"
        echo "Please create .env.local with the following variables:"
        echo "  GOOGLE_CLIENT_ID=your_google_client_id"
        echo "  GOOGLE_CLIENT_SECRET=your_google_client_secret"
        echo "  NEXTAUTH_SECRET=your_nextauth_secret"
        echo "  NEXTAUTH_URL=http://localhost:3000"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 {build|start|stop|restart|logs|shell|clean|db-shell|db-reset|help}"
    echo ""
    echo "Commands:"
    echo "  build     - Build the Docker image"
    echo "  start     - Start the container"
    echo "  stop      - Stop the container"
    echo "  restart   - Restart the container"
    echo "  logs      - Show container logs"
    echo "  shell     - Open shell in running container"
    echo "  clean     - Remove containers and images"
    echo "  db-shell  - Open PostgreSQL shell"
    echo "  db-reset  - Reset database (remove all data)"
    echo "  help      - Show this help message"
}

# Function to build the image
build() {
    print_status "Building Docker image..."
    docker-compose build
    print_success "Build completed!"
}

# Function to start the container
start() {
    check_env
    print_status "Starting container..."
    docker-compose up -d
    print_success "Container started! App available at http://localhost:3000"
    print_status "PostgreSQL available at localhost:5432"
    print_status "Running Prisma generate and migrations in the app container..."
    docker-compose exec ainterest npx prisma generate
    docker-compose exec ainterest npx prisma migrate deploy
    print_success "Prisma migrations applied!"
}

# Function to stop the container
stop() {
    print_status "Stopping container..."
    docker-compose down
    print_success "Container stopped!"
}

# Function to restart the container
restart() {
    print_status "Restarting container..."
    docker-compose down
    docker-compose up -d
    print_success "Container restarted!"
}

# Function to show logs
logs() {
    print_status "Showing container logs..."
    docker-compose logs -f
}

# Function to open shell in container
shell() {
    print_status "Opening shell in container..."
    docker-compose exec ainterest sh
}

# Function to open PostgreSQL shell
db_shell() {
    print_status "Opening PostgreSQL shell..."
    docker-compose exec postgres psql -U ainterest_user -d ainterest
}

# Function to reset database
db_reset() {
    print_warning "This will remove all database data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Resetting database..."
        docker-compose down
        docker volume rm ainterest_postgres_data
        print_success "Database reset completed!"
    else
        print_status "Database reset cancelled."
    fi
}

# Function to clean up
clean() {
    print_warning "This will remove all containers and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up..."
        docker-compose down --rmi all --volumes --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Main script logic
case "$1" in
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    shell)
        shell
        ;;
    db-shell)
        db_shell
        ;;
    db-reset)
        db_reset
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac 