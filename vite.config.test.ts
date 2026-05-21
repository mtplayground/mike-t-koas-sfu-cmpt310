import { describe, expect, it } from "vitest";
import { normalizeBasePath } from "./vite.config";

describe("normalizeBasePath", () => {
  it("defaults missing and root values to slash", () => {
    expect(normalizeBasePath(undefined)).toBe("/");
    expect(normalizeBasePath("")).toBe("/");
    expect(normalizeBasePath(" / ")).toBe("/");
  });

  it("adds leading and trailing slashes for static subpath deploys", () => {
    expect(normalizeBasePath("cmpt310")).toBe("/cmpt310/");
    expect(normalizeBasePath("/cmpt310")).toBe("/cmpt310/");
    expect(normalizeBasePath("cmpt310/app/")).toBe("/cmpt310/app/");
  });
});
