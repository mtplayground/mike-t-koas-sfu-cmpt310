import { expect, test } from "@playwright/test";
import { buildStepExplanation } from "../src/components/explanation/stepExplanations";
import { buildChainRuleMath } from "../src/components/math/chainRuleMath";
import { createStepController } from "../src/lib/network";

test("walks through forward, loss, backward, and update steps", async ({ page }) => {
  const controller = createStepController();
  const { network, steps, updates } = controller.getState();

  await page.goto("/");

  const navigation = page.locator("[data-navigation-step]");
  const mathPanel = page.locator("[data-chain-rule-step]");
  const explanationPanel = page.locator("[data-explanation-step]");
  const nextButton = page.getByRole("button", { name: "Next" });
  const resetButton = page.getByRole("button", { name: "Reset" });

  await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();
  await expect(resetButton).toBeDisabled();

  for (const [index, step] of steps.entries()) {
    const math = buildChainRuleMath({ step, network, updates });
    const explanation = buildStepExplanation({ step, network, updates });

    await expect(navigation).toHaveAttribute("data-navigation-step", step.id);
    await expect(mathPanel).toHaveAttribute("data-chain-rule-step", step.id);
    await expect(mathPanel).toHaveAttribute("data-chain-rule-latex", math.latex);
    await expect(explanationPanel).toHaveAttribute("data-explanation-step", step.id);
    await expect(explanationPanel).toContainText(explanation.heading);
    await expect(explanationPanel).toContainText(explanation.body);
    await expect(explanationPanel).toContainText(explanation.detail);
    await expect(page.getByText(`Step ${index + 1} of ${steps.length}`)).toBeVisible();

    if (index < steps.length - 1) {
      await nextButton.click();
    }
  }

  await expect(nextButton).toBeDisabled();
  await expect(resetButton).toBeEnabled();

  await resetButton.click();
  await expect(navigation).toHaveAttribute("data-navigation-step", steps[0].id);
  await expect(page.getByText(`Step 1 of ${steps.length}`)).toBeVisible();
});
