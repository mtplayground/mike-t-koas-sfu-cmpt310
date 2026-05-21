import "./styles/index.css";
import { AppShell } from "./components/layout/AppShell";
import { Math } from "./components/math/Math";

export function App() {
  return (
    <AppShell
      diagram={<DiagramPlaceholder />}
      math={<MathPlaceholder />}
      explanation={<ExplanationPlaceholder />}
    />
  );
}

function DiagramPlaceholder() {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-zinc-300 bg-stone-100/70 p-6">
      <div className="grid gap-4 text-center">
        <div className="mx-auto grid grid-cols-3 items-center gap-3 text-sm font-semibold text-zinc-700">
          <span className="rounded-full border border-teal-300 bg-teal-50 px-4 py-3">
            x
          </span>
          <span className="h-px w-10 bg-zinc-300" aria-hidden="true" />
          <span className="rounded-full border border-coral-300 bg-coral-50 px-4 py-3">
            y
          </span>
        </div>
        <p className="text-sm text-zinc-500">Diagram region</p>
      </div>
    </div>
  );
}

function MathPlaceholder() {
  return (
    <div className="rounded-lg bg-stone-100 px-4 py-5 text-zinc-900">
      <Math
        latex={String.raw`\frac{\partial L}{\partial w} = \frac{\partial L}{\partial y}\cdot\frac{\partial y}{\partial w}`}
        displayMode
        ariaLabel="partial derivative of loss with respect to weight"
      />
    </div>
  );
}

function ExplanationPlaceholder() {
  return (
    <p className="text-sm leading-6 text-zinc-600">
      Step context will appear here as the controller advances through the training
      sequence.
    </p>
  );
}
