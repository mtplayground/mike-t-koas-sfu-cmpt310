import { useMemo } from "react";
import "./styles/index.css";
import { AppShell } from "./components/layout/AppShell";
import { Math } from "./components/math/Math";
import { NetworkDiagram } from "./components/network/NetworkDiagram";
import { createStepController } from "./lib/network";

export function App() {
  const stepState = useMemo(() => createStepController().getState(), []);

  return (
    <AppShell
      diagram={<NetworkDiagram activeStep={stepState.currentStep} />}
      math={<MathPlaceholder />}
      explanation={<ExplanationPlaceholder />}
    />
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
