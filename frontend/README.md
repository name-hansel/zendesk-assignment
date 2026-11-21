# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Ticket API

The frontend uses `GET /api/tickets` to load tickets, `GET /api/tickets/{id}` to load ticket details, and `POST /api/tickets` to create them. During development, Vite proxies `/api` to `http://localhost:8080`; set `API_PROXY_TARGET` in the Vite environment to use a different backend host. Set `VITE_API_BASE_URL` when the frontend needs an absolute API URL. Cross-origin deployments must also enable CORS on the backend.

The create request sends `subject`, `description`, and either a UUID `customerUuid` or inline `customer` details. The current backend response does not include priority, type, channel, group, tags, or comments, so the frontend adapter supplies defaults for those UI-only fields.

If the ticket list cannot be loaded before any successful API response, the app shows its sample tickets with an error notice and retry action. Create failures remain visible errors and are not treated as successful local creations.
