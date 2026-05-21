import type { StepControllerState } from "../../lib/network";

interface StepNavigationProps {
  state: StepControllerState;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
}

const buttonBase =
  "inline-flex min-h-10 w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 sm:w-auto";

export function StepNavigation({
  state,
  onNext,
  onPrevious,
  onReset,
}: StepNavigationProps) {
  return (
    <nav
      className="mt-4 grid grid-cols-2 items-center gap-3 border-t border-zinc-200 pt-4 sm:grid-cols-[auto_auto_minmax(7rem,1fr)_auto]"
      aria-label="Step navigation"
      aria-describedby="step-navigation-help"
      data-navigation-step={state.currentStep.id}
    >
      <p id="step-navigation-help" className="sr-only">
        Use Left Arrow for previous, Right Arrow for next, and Home to reset the
        walkthrough.
      </p>
      <button
        type="button"
        className={`${buttonBase} border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50`}
        onClick={onPrevious}
        disabled={!state.canGoPrevious}
        aria-label="Go to previous step"
        aria-keyshortcuts="ArrowLeft"
      >
        Previous
      </button>
      <button
        type="button"
        className={`${buttonBase} border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50`}
        onClick={onReset}
        disabled={!state.canGoPrevious}
        aria-label="Reset walkthrough to first step"
        aria-keyshortcuts="Home"
      >
        Reset
      </button>
      <p
        className="col-span-2 text-center text-sm font-medium text-zinc-600 sm:col-span-1"
        aria-live="polite"
      >
        Step {state.currentIndex + 1} of {state.steps.length}
      </p>
      <button
        type="button"
        className={`${buttonBase} col-span-2 border-teal-700 bg-teal-700 text-white hover:bg-teal-800 sm:col-span-1`}
        onClick={onNext}
        disabled={!state.canGoNext}
        aria-label="Go to next step"
        aria-keyshortcuts="ArrowRight"
      >
        Next
      </button>
    </nav>
  );
}
