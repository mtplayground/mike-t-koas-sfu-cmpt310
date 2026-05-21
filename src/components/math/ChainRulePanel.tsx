import type { StepControllerState } from "../../lib/network";
import { Math } from "./Math";
import { buildChainRuleMath } from "./chainRuleMath";

interface ChainRulePanelProps {
  state: StepControllerState;
}

export function ChainRulePanel({ state }: ChainRulePanelProps) {
  const math = buildChainRuleMath({
    step: state.currentStep,
    network: state.network,
    updates: state.updates,
  });

  return (
    <section
      className="grid gap-3 rounded-lg bg-stone-100 px-4 py-5 text-zinc-900"
      aria-labelledby="chain-rule-title"
      data-chain-rule-step={state.currentStep.id}
      data-chain-rule-latex={math.latex}
    >
      <div className="grid gap-1">
        <h2 id="chain-rule-title" className="text-sm font-semibold text-zinc-950">
          {state.currentStep.title}
        </h2>
        <p className="text-xs font-medium text-zinc-500">{state.currentStep.phase}</p>
      </div>
      <Math latex={math.latex} displayMode ariaLabel={math.ariaLabel} />
    </section>
  );
}
