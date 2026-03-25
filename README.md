# FSD App

A web application that integrates with Airtable to synchronize project data -- bases, tables, records, revision history, and users -- and presents it in an interactive, searchable data grid.

## How It Works

### 1. Connect Airtable

The user signs in via OAuth 2.0 and authorizes the app to access their Airtable workspace. The app stores and automatically refreshes the access token, so re-authorization is only needed if the connection is revoked.

### 2. Synchronize Data

Once connected, the app fetches all bases, tables, and records through the official Airtable REST API. Pagination is handled automatically. All fetched data is stored in MongoDB for fast retrieval and offline access.

### 3. Scrape Revision History and Users

Revision history (status and assignee changes per record) and workspace users are not available through the public Airtable API. To retrieve them, the app uses a headless browser (Camoufox) that logs into Airtable and calls its internal endpoints.

The user provides their Airtable credentials once through a dialog in the UI. The app then handles session cookies, PerimeterX anti-bot challenges, and MFA (multi-factor authentication) automatically -- if MFA is enabled on the account, the user enters the code in the UI and the scraper proceeds without interruption. Cookies are cached and reused until they expire.

### 4. Browse in the Data Grid

All synced data is displayed in an interactive table powered by AG Grid. The user selects a collection from dropdown menus, and the grid renders columns dynamically based on the selected collection's fields. Full-text search, per-column filtering, and sorting are supported out of the box. The UI is built with Angular Material and AG Grid.

## Data Flow

```
Airtable workspace
       │
       ├── REST API (OAuth)  ──►  Bases, Tables, Records
       │
       └── Internal API (Scraper)  ──►  Revision History, Users
                                              │
                                              ▼
                                          MongoDB
                                              │
                                              ▼
                                      Express REST API
                                              │
                                              ▼
                                    Angular SPA (Data Grid)
```

## Tech Stack

- **Backend:** Node.js 22, Express, Mongoose, Camoufox, Swagger / OpenAPI
- **Frontend:** Angular 19, Angular Material, AG Grid, TypeScript
- **Database:** MongoDB 7
- **Infrastructure:** Docker Compose, nginx, Let's Encrypt

## Project Structure

```
fsd-app/
├── backend/                   # Express API server
│   └── src/
│       ├── core/              # Database connection, server bootstrap
│       ├── modules/
│       │   ├── airtable-bases/
│       │   ├── airtable-connections/
│       │   ├── airtable-oauth/
│       │   ├── airtable-records/
│       │   ├── airtable-scraper/
│       │   ├── airtable-tables/
│       │   ├── auth/
│       │   └── health/
│       └── shared/            # Middleware, utilities, OpenAPI config
├── frontend/                  # Angular SPA
│   └── src/app/
│       ├── features/
│       │   ├── airtable/      # Sync dialogs, credentials, services
│       │   ├── auth/          # Sign-in, OAuth callback, session
│       │   ├── dashboard/
│       │   ├── data-grid/     # AG Grid page with dynamic columns
│       │   ├── errors/
│       │   └── legal/         # Terms of Service, Privacy Policy
│       └── shared/            # Layouts, confirm dialog
├── docker/nginx/              # nginx configs (dev + production)
├── docker-compose.yml         # Local development stack
├── docker-compose.prod.yml    # Production overlay (SSL, ports)
└── DEPLOYMENT.md              # Server deployment guide
```

## API Documentation

Interactive Swagger UI is available at `/doc` after starting the application.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for system requirements, server setup, SSL configuration, and the deploy script.
