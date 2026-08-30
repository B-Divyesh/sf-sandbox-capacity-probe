export interface ScenarioInput {
  containers: number;
  ports: number;
  mounts: number;
  baselineMs: number;
  budgetMs: number;
}

export interface ScenarioResult {
  predictedMs: number;
  bindingPressure: number;
  mountPressure: number;
  status: "comfortable" | "watch" | "exceeded";
  headroomMs: number;
}

function isWholeNumberInRange(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum;
}

export function isScenarioInput(value: unknown): value is ScenarioInput {
  if (typeof value !== "object" || value === null) return false;
  const scenario = value as Record<string, unknown>;
  return isWholeNumberInRange(scenario.containers, 1, 64)
    && isWholeNumberInRange(scenario.ports, 0, 16)
    && isWholeNumberInRange(scenario.mounts, 0, 16)
    && isWholeNumberInRange(scenario.baselineMs, 1, 60_000)
    && isWholeNumberInRange(scenario.budgetMs, 50, 60_000);
}

export function calculateScenario(input: ScenarioInput): ScenarioResult {
  const bindingPressure = input.containers * input.ports;
  const mountPressure = input.containers * input.mounts;
  const predictedMs = Math.round(
    input.baselineMs + bindingPressure * 3.6 + mountPressure * 0.8 + Math.pow(input.containers, 1.35) * 1.9
  );
  const ratio = predictedMs / Math.max(1, input.budgetMs);
  return {
    predictedMs,
    bindingPressure,
    mountPressure,
    status: ratio <= 0.7 ? "comfortable" : ratio <= 1 ? "watch" : "exceeded",
    headroomMs: input.budgetMs - predictedMs
  };
}

export function probeCommand(input: ScenarioInput, target = "staging-west"): string {
  return `capacity-probe probe --target ${target} --confirm ${target} --containers ${input.containers} --ports-per-container ${input.ports} --mounts ${input.mounts} --samples 3 --startup-budget-ms ${input.budgetMs} --output capacity.json`;
}

export function csvForScenarios(scenarios: Array<ScenarioInput & ScenarioResult>): string {
  const header = "containers,ports,mounts,baseline_ms,budget_ms,predicted_p95_ms,status,headroom_ms";
  return [
    header,
    ...scenarios.map((scenario) =>
      [
        scenario.containers,
        scenario.ports,
        scenario.mounts,
        scenario.baselineMs,
        scenario.budgetMs,
        scenario.predictedMs,
        scenario.status,
        scenario.headroomMs
      ].join(",")
    )
  ].join("\n");
}
