# Docker & Docker Compose for Frontend

This project is fully dockerized for easy deployment and local development.

## Dockerfile
- Multi-stage build for production-ready Next.js frontend.
- Uses Node 20 Alpine for minimal image size.
- Installs dependencies, builds the app, and runs as a non-root user.
- Exposes port 3000.

## .dockerignore
- Excludes node_modules, .next, git files, environment files, backend, markdown, and logs from the Docker build context.

## docker-compose.yml
- Defines a `frontend` service.
- Builds from the Dockerfile in the current directory.
- Loads environment variables from `.env.local`.
- Maps port 3000 on the host to 3000 in the container.
- Restarts automatically unless stopped.

## Usage

### Build and Run with Docker
```
docker build -t my-frontend .
docker run -p 3000:3000 my-frontend
```

### Build and Run with Docker Compose
```
docker-compose up --build
```

- The app will be available at http://localhost:3000
- Make sure your `.env.local` is present for API URLs and secrets.

## Customization
- To add backend or database services, extend `docker-compose.yml`.
- For development, you can mount volumes and use `npm run dev` in the Dockerfile.

---

For more details, see the Dockerfile and docker-compose.yml in the project root.
