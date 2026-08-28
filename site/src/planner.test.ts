import { describe, expect, it } from "vitest";
import { calculateScenario, csvForScenarios, probeCommand } from "./planner";

describe("capacity planner", () => {
  const input = { containers: 12, ports: 2, mounts: 1, baselineMs: 180, budgetMs: 1500 };

  it("returns a transparent deterministic planning estimate", () => {
    const result = calculateScenario(input);
    expect(result.predictedMs).toBe(330);
    expect(result.bindingPressure).toBe(24);
    expect(result.status).toBe("comfortable");
  });

  it("builds the documented safe command", () => {
    expect(probeCommand(input)).toContain("--target staging-west --confirm staging-west");
    expect(probeCommand(input)).toContain("--output capacity.json");
  });

  it("exports core data without a license", () => {
    const result = calculateScenario(input);
    expect(csvForScenarios([{ ...input, ...result }])).toContain("12,2,1,180,1500,330,comfortable");
  });
});
