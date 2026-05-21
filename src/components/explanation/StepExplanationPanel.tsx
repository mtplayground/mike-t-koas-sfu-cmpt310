import type { StepControllerState } from "../../lib/network";
import { buildStepExplanation } from "./stepExplanations";

interface StepExplanationPanelProps {
  state: StepControllerState;
}

export function StepExplanationPanel({ state }: StepExplanationPanelProps) {
  const explanation = buildStepExplanation({
    step: state.currentStep,
    network: state.network,
    updates: state.updates,
  });

  return (
    <article
      className="grid gap-3 text-sm leading-6 text-zinc-700"
      aria-labelledby="step-explanation-heading"
      data-explanation-step={state.currentStep.id}
    >
      <h3
        id="step-explanation-heading"
        className="text-base font-semibold leading-6 text-zinc-950"
      >
        {explanation.heading}
      </h3>
      <p>{explanation.body}</p>
      <p className="border-l-2 border-teal-600 pl-3 text-zinc-600">
        {explanation.detail}
      </p>
    </article>
  );
}
