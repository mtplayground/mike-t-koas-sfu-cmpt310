import type { StepControllerState } from "../../lib/network";

interface StepNavigationProps {
  state: StepControllerState;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
}

const buttonBase =
  "inline-flex min-h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400";

export function StepNavigation({
  state,
  onNext,
  onPrevious,
  onReset,
}: StepNavigationProps) {
  return (
    <nav
      className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-4"
      aria-label="Step navigation"
      data-navigation-step={state.currentStep.id}
    >
      <button
        type="button"
        className={`${buttonBase} border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50`}
        onClick={onPrevious}
        disabled={!state.canGoPrevious}
        aria-keyshortcuts="ArrowLeft"
      >
        Previous
      </button>
      <button
        type="button"
        className={`${buttonBase} border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50`}
        onClick={onReset}
        disabled={!state.canGoPrevious}
      >
        Reset
      </button>
      <p
        className="min-w-24 text-center text-sm font-medium text-zinc-600"
        aria-live="polite"
      >
        Step {state.currentIndex + 1} of {state.steps.length}
      </p>
      <button
        type="button"
        className={`${buttonBase} border-teal-700 bg-teal-700 text-white hover:bg-teal-800`}
        onClick={onNext}
        disabled={!state.canGoNext}
        aria-keyshortcuts="ArrowRight"
      >
        Next
      </button>
    </nav>
  );
}
