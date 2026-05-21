# Product Snapshot

## What This Is

CMPT 310 Neural Network Walkthrough is a static Vite + React + TypeScript app
that explains one fixed neural-network training step. It is built as an
interactive teaching aid: users step through forward propagation, loss
calculation, backpropagation, and one gradient-descent update while the diagram,
math, and narration stay synchronized.

## What It Does

- Visualizes a fixed two-input, two-hidden-neuron, one-output network as an SVG.
- Highlights the active node or edge for the current walkthrough step.
- Animates forward activations and backward gradients along visible edges.
- Renders live KaTeX math for the active step with current numeric values
  substituted.
- Shows plain-language narration for each step.
- Provides previous, next, and reset controls, plus keyboard navigation:
  Left Arrow, Right Arrow, and Home.
- Includes accessibility and responsive polish for small screens, ARIA labels,
  skip-link navigation, disabled control states, and reduced-motion handling.

## Architecture

- `src/lib/autograd/` contains the scalar `Value` autograd engine, forward ops,
  activation functions, loss, reverse-mode topological backprop, and unit tests.
- `src/lib/network/` defines the preset training example, weights, fixed network,
  step descriptors, controller state, and parameter updates.
- `src/components/network/` renders the SVG network diagram and D3-based
  activation/gradient animations.
- `src/components/math/` renders KaTeX and builds step-specific chain-rule
  expressions.
- `src/components/explanation/` builds and displays step narration.
- `src/components/navigation/` provides bounded step controls.
- `src/components/layout/` assembles diagram, controls, math, and explanation
  into the responsive shell.

## Conventions

- The app is static; there is no backend or database.
- Vite serves development and preview on `0.0.0.0:8080`.
- `VITE_BASE_PATH` controls the static deployment base path and defaults to `/`.
- Build output is `dist/`; it is verified by `npm run verify:static`.
- Local Playwright artifacts are ignored via `test-results/` and
  `playwright-report/`.

## Validation

Current verification commands:

```bash
npm run format:check
npm run lint
npm test
npm run build
npm run test:e2e
npm run verify:static
```

For subpath deployment validation:

```bash
VITE_BASE_PATH=/mike-t-koas-sfu-cmpt310/ npm run verify:static
```
