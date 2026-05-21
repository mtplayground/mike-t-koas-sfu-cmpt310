import { useMemo } from "react";
import "./styles/index.css";
import { AppShell } from "./components/layout/AppShell";
import { ChainRulePanel } from "./components/math/ChainRulePanel";
import { NetworkDiagram } from "./components/network/NetworkDiagram";
import { createStepController } from "./lib/network";

export function App() {
  const stepState = useMemo(() => createStepController().getState(), []);

  return (
    <AppShell
      diagram={<NetworkDiagram activeStep={stepState.currentStep} />}
      math={<ChainRulePanel state={stepState} />}
      explanation={<ExplanationPlaceholder />}
    />
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
