# Concept Lens

A tool for understanding how concepts across independent systems relate.

Backend and frontend live in one repository and build into a **single executable Spring Boot
jar**: the React app is compiled onto the application classpath, so one process serves both the
API and the UI.

## Requirements

- **JDK 21** — the build targets Java 21. Maven itself is provided by the wrapper (`./mvnw`).
- **Node 22 LTS** — *not required to build.* The Maven build downloads its own Node/npm into
  `frontend/node/`. Install it locally only if you want to run frontend tooling directly;
  `.nvmrc` pins the major version, and `pom.xml` pins the exact version used by the build.

## Build and run

A full build is one command:

```bash
./mvnw clean package
java -jar target/concept-lens-0.0.1-SNAPSHOT.jar
```

The app is then at <http://localhost:8080>.

`package` runs both test suites — JUnit for the backend, Vitest for the frontend. Use
`./mvnw clean package -DskipTests` to skip both.

## Development

Run the two sides separately for hot reload. In one terminal:

```bash
./mvnw spring-boot:run          # backend on :8080
```

In another:

```bash
cd frontend && npm install && npm run dev    # UI on :5173
```

Vite proxies `/api` to `:8080`, so the browser only ever talks to one origin and no CORS
configuration is needed.

## Layout

```
pom.xml                     Single Maven project: Spring Boot app + React build
src/main/java/com/conceptlens/
                            Backend sources
  config/SpaForwardingConfig.java
                            Serves client-side routes from index.html
src/main/resources/         Backend configuration
src/test/java/              Backend tests
frontend/                   Vite + React + TypeScript app
  src/compare/              Compare page and its sections
  src/mappings/             Mappings page, mapping rows and drawers
  src/domain/               Concept model, relationship logic, demo fixtures
  src/components/           Shared UI: header, hero, drawer, toast
  src/api/                  HTTP client for the backend API
  src/styles/               Design tokens and global styles
ui-mock/                    UX mock — the source of truth for the UI. Do not edit.
```

`frontend/vite.config.ts` writes the production build to `target/classes/static`, which Spring
Boot serves from the classpath.

## Routing

`/api/**` is reserved for the backend; an unmapped API path returns 404. Every other request that
does not match a built asset is answered with `index.html`, so React Router owns client-side
routes and they survive a direct load or refresh.

## Frontend scripts

Run from `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run lint` | ESLint |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest, watch mode |

## Status

The UI from `ui-mock/concept_lens_mock_ui.html` has been migrated to React and behaves as the
mock does, but it still runs entirely on the demo fixtures in `frontend/src/domain/`. No backend
API exists yet, so nothing is persisted and no new functionality has been added.
