# CMPT 310 Neural Network Walkthrough

A Vite, React, and TypeScript app for an interactive neural network training
walkthrough.

## Development

```bash
npm install
npm run dev
```

The development server is configured for `0.0.0.0:8080`.

## Configuration

Copy `.env.example` to `.env` when local overrides are needed.

- `VITE_BASE_PATH`: Vite base path for static deployment. Defaults to `/`.

## Quality Checks

```bash
npm run lint
npm run format:check
npm run build
npm run test:e2e
```

## Static Deployment

Build output is written to `dist/` and can be served by any static file host.

For a domain-root deployment:

```bash
VITE_BASE_PATH=/ npm run verify:static
```

For a subpath deployment, set `VITE_BASE_PATH` to the public mount path:

```bash
VITE_BASE_PATH=/mike-t-koas-sfu-cmpt310/ npm run verify:static
```

Serve the generated directory after the check passes:

```bash
npm run preview
```

The preview server serves `dist/` on `0.0.0.0:8080`.
