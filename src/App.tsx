import { useMemo } from "react";
import "./styles/index.css";
import { StepExplanationPanel } from "./components/explanation/StepExplanationPanel";
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
      explanation={<StepExplanationPanel state={stepState} />}
    />
  );
}
