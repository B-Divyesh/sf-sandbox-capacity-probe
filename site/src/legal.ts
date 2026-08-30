import "./styles.css";
import { initRouteFocus } from "./route-focus";

document.querySelector("main")?.setAttribute("tabindex", "-1");
initRouteFocus();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
