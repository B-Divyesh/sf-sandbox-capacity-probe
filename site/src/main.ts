import "./styles.css";
import {
  calculateScenario,
  csvForScenarios,
  isScenarioInput,
  probeCommand,
  type ScenarioInput,
  type ScenarioResult
} from "./planner";
import { initRouteFocus } from "./route-focus";

const slug = "sandbox-capacity-probe";
const demoKey = `demo:${slug}:scenario`;
const demoScenario: ScenarioInput = { containers: 24, ports: 4, mounts: 2, baselineMs: 240, budgetMs: 1500 };

const $ = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const inputs = {
  containers: $("#containers") as HTMLInputElement,
  ports: $("#ports") as HTMLInputElement,
  mounts: $("#mounts") as HTMLInputElement,
  baselineMs: $("#baseline") as HTMLInputElement,
  budgetMs: $("#budget") as HTMLInputElement
};

const readInput = (): ScenarioInput => ({
  containers: Number(inputs.containers.value),
  ports: Number(inputs.ports.value),
  mounts: Number(inputs.mounts.value),
  baselineMs: Number(inputs.baselineMs.value),
  budgetMs: Number(inputs.budgetMs.value)
});

const demoMode = new URL(window.location.href).searchParams.get("demo") === "1";
let current: (ScenarioInput & ScenarioResult) | null = null;

function writeInput(input: ScenarioInput): void {
  inputs.containers.value = String(input.containers);
  inputs.ports.value = String(input.ports);
  inputs.mounts.value = String(input.mounts);
  inputs.baselineMs.value = String(input.baselineMs);
  inputs.budgetMs.value = String(input.budgetMs);
}

function inputError(): string | null {
  const fields: Array<[HTMLInputElement, string, number, number]> = [
    [inputs.containers, "Concurrent containers", 1, 64],
    [inputs.ports, "Ports per container", 0, 16],
    [inputs.mounts, "Mounts per container", 0, 16],
    [inputs.baselineMs, "Baseline startup", 1, 60_000],
    [inputs.budgetMs, "p95 budget", 50, 60_000]
  ];
  for (const [field] of fields) field.removeAttribute("aria-invalid");
  for (const [field, label, minimum, maximum] of fields) {
    const value = Number(field.value);
    if (!field.value || !Number.isFinite(value) || !Number.isInteger(value) || value < minimum || value > maximum) {
      field.setAttribute("aria-invalid", "true");
      const unit = field === inputs.baselineMs || field === inputs.budgetMs ? " ms" : "";
      return `${label} must be a whole number between ${minimum.toLocaleString()} and ${maximum.toLocaleString()}${unit}. Correct it to calculate or export this scenario.`;
    }
  }
  return null;
}

function setPlannerActions(valid: boolean): void {
  $("#export-csv").toggleAttribute("disabled", !valid);
  $("#copy-command").toggleAttribute("disabled", !valid);
}

function clearCalculatedFields(): void {
  $("#prediction").textContent = "—";
  $("#binding-count").textContent = "—";
  $("#headroom").textContent = "—";
  const status = $("#status");
  status.textContent = "needs valid input";
  delete status.dataset.status;
  $("#planner-summary").textContent = "No estimate is available until every planner value is valid.";
  $("#generated-command").textContent = "Correct the planner inputs to create a command.";
}

function renderPlanner(): boolean {
  const error = inputError();
  const errorElement = $("#planner-error");
  if (error) {
    current = null;
    errorElement.textContent = error;
    errorElement.hidden = false;
    clearCalculatedFields();
    setPlannerActions(false);
    return false;
  }
  errorElement.textContent = "";
  errorElement.hidden = true;
  const input = readInput();
  const result = calculateScenario(input);
  current = { ...input, ...result };
  $("#container-value").textContent = String(input.containers);
  $("#port-value").textContent = String(input.ports);
  $("#mount-value").textContent = String(input.mounts);
  $("#prediction").textContent = `${result.predictedMs} ms`;
  $("#binding-count").textContent = String(result.bindingPressure);
  $("#headroom").textContent = `${Math.abs(result.headroomMs)} ms ${result.headroomMs >= 0 ? "remaining" : "over"}`;
  const status = $("#status");
  status.textContent = result.status;
  status.dataset.status = result.status;
  $("#planner-summary").textContent = `Planning estimate: ${result.predictedMs} milliseconds p95, ${result.status}, with ${Math.abs(result.headroomMs)} milliseconds ${result.headroomMs >= 0 ? "headroom" : "over budget"}.`;
  $("#generated-command").textContent = probeCommand(input);
  setPlannerActions(true);
  return true;
}

for (const input of Object.values(inputs)) {
  input.addEventListener("input", () => {
    const valid = renderPlanner();
    if (demoMode && valid) localStorage.setItem(demoKey, JSON.stringify(readInput()));
  });
}

$("#planner-form").addEventListener("submit", (event) => event.preventDefault());

function initDemo(): void {
  if (!demoMode) return;
  document.title = "Demo — Sandbox Capacity Probe";
  document.querySelector('meta[name="description"]')?.setAttribute("content", "Try the real bundled CLI sample and an isolated capacity-planning scenario.");
  $("#demo-banner").hidden = false;
  let saved: ScenarioInput | null = null;
  try {
    const value = localStorage.getItem(demoKey);
    const parsed: unknown = value ? JSON.parse(value) : null;
    saved = isScenarioInput(parsed) ? parsed : null;
  } catch {
    saved = null;
  }
  writeInput(saved ?? demoScenario);
  localStorage.setItem(demoKey, JSON.stringify(readInput()));
  $("#reset-demo").addEventListener("click", () => {
    writeInput(demoScenario);
    localStorage.setItem(demoKey, JSON.stringify(demoScenario));
    renderPlanner();
    $("#planner-summary").textContent = "Demo reset to the bundled sample scenario.";
  });
  $("#start-real").addEventListener("click", () => localStorage.removeItem(demoKey));
}

$("#copy-demo-command").addEventListener("click", async () => {
  const button = $("#copy-demo-command") as HTMLButtonElement;
  try {
    await navigator.clipboard.writeText("capacity-probe demo");
    button.textContent = "Copied demo command";
    setTimeout(() => (button.textContent = "Copy demo command"), 1600);
  } catch {
    button.textContent = "Select the command to copy";
  }
});

$("#replay-demo").addEventListener("click", () => {
  const recording = document.querySelector<HTMLElement>(".terminal-recording");
  if (!recording) return;
  recording.classList.remove("is-replaying");
  requestAnimationFrame(() => recording.classList.add("is-replaying"));
});

$("#copy-command").addEventListener("click", async () => {
  const button = $("#copy-command") as HTMLButtonElement;
  try {
    await navigator.clipboard.writeText($("#generated-command").textContent ?? "");
    button.textContent = "Copied";
    setTimeout(() => (button.textContent = "Copy command"), 1600);
  } catch {
    button.textContent = "Select command to copy";
  }
});

$("#export-csv").addEventListener("click", () => {
  if (!current || inputError()) return;
  const csv = csvForScenarios([current]);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "sandbox-capacity-scenario.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});

function updateConnection(): void {
  const badge = $("#connection-state");
  const online = navigator.onLine;
  badge.textContent = online ? "Online · planner and docs work" : "Offline · planner and docs still work";
  badge.dataset.online = String(online);
}

window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);

initDemo();
renderPlanner();
updateConnection();
initRouteFocus(demoMode && Boolean(window.location.hash));

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
