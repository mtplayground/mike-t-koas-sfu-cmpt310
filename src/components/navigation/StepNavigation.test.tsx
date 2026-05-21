import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createStepController } from "../../lib/network";
import { StepNavigation } from "./StepNavigation";

const noop = () => undefined;

describe("StepNavigation", () => {
  it("disables previous and reset at the first step", () => {
    const state = createStepController().getState();
    const markup = renderToStaticMarkup(
      <StepNavigation state={state} onNext={noop} onPrevious={noop} onReset={noop} />,
    );

    expect(markup).toContain('data-navigation-step="forward:x1"');
    expect(markup).toContain("Step 1 of 16");
    expect(markup.match(/disabled=""/g)).toHaveLength(2);
    expect(markup).toContain('aria-keyshortcuts="ArrowRight"');
    expect(markup).toContain('aria-keyshortcuts="ArrowLeft"');
  });

  it("disables next at the final step", () => {
    const controller = createStepController();

    for (let index = 0; index < 100; index += 1) {
      controller.next();
    }

    const state = controller.getState();
    const markup = renderToStaticMarkup(
      <StepNavigation state={state} onNext={noop} onPrevious={noop} onReset={noop} />,
    );

    expect(markup).toContain('data-navigation-step="update:gradient-descent"');
    expect(markup).toContain("Step 16 of 16");
    expect(markup.match(/disabled=""/g)).toHaveLength(1);
  });
});
