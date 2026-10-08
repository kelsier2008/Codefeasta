import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./styles/globals.css";
import { App } from "./App";

async function enableMocks() {
  if (import.meta.env.VITE_USE_MOCKS === "false") return;
  const { worker } = await import("./api/mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
}

enableMocks().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
