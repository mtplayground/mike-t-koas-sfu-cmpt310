import { useCallback, useEffect, useMemo, useState } from "react";
import "./styles/index.css";
import { StepExplanationPanel } from "./components/explanation/StepExplanationPanel";
import { AppShell } from "./components/layout/AppShell";
import { ChainRulePanel } from "./components/math/ChainRulePanel";
import { StepNavigation } from "./components/navigation/StepNavigation";
import { NetworkDiagram } from "./components/network/NetworkDiagram";
import { createStepController } from "./lib/network";

export function App() {
  const controller = useMemo(() => createStepController(), []);
  const [stepState, setStepState] = useState(() => controller.getState());

  const goNext = useCallback(() => {
    setStepState(controller.next());
  }, [controller]);

  const goPrevious = useCallback(() => {
    setStepState(controller.previous());
  }, [controller]);

  const reset = useCallback(() => {
    setStepState(controller.reset());
  }, [controller]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setStepState(controller.next());
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setStepState(controller.previous());
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [controller]);

  return (
    <AppShell
      controls={
        <StepNavigation
          state={stepState}
          onNext={goNext}
          onPrevious={goPrevious}
          onReset={reset}
        />
      }
      diagram={<NetworkDiagram activeStep={stepState.currentStep} />}
      math={<ChainRulePanel state={stepState} />}
      explanation={<StepExplanationPanel state={stepState} />}
    />
  );
}
