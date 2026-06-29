/**
 * Smoke test — boots the production server (`next start`) and asserts that key
 * routes respond without server errors. Runs WITHOUT Supabase env: pages are
 * written to degrade gracefully (empty data / setup notice), so a green smoke
 * run proves the app renders end-to-end. With env + seed configured, the same
 * routes return populated pages.
 *
 * Run: npm run build && npm run smoke
 */
import { spawn, spawnSync } from "node:child_process";

const PORT = Number(process.env.SMOKE_PORT ?? 3100);
const BASE = `http://localhost:${PORT}`;

// path → acceptable status codes
const ROUTES: Record<string, number[]> = {
  "/": [200],
  "/tally": [200],
  "/standings": [200],
  "/schedule": [200],
  "/results": [200],
  "/venues": [200],
  "/delegations": [200],
  "/athletes": [200],
  "/announcements": [200],
  "/livestream": [200],
  "/host/overview": [200],
  "/host/accommodation": [200],
  "/host/food-dining": [200],
  "/host/tourist-spots": [200],
  "/host/transportation": [200],
  "/host/map": [200],
  "/host/emergency": [200],
  "/host/committees": [200],
  "/records": [200],
  "/mascot": [200],
  "/feedback": [200],
  "/tally/breakdown": [200],
  "/admin/login": [200],
  "/admin": [200, 307, 302], // redirects to /admin/login when unauthenticated
  "/sitemap.xml": [200],
  "/robots.txt": [200],
  "/no-such-page": [404],
};

async function waitForServer(timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE, { redirect: "manual" });
      if (res.status > 0) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Server did not start within timeout");
}

async function main() {
  console.log(`→ Starting production server on :${PORT}…`);
  const server = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "start", "-p", String(PORT)],
    { stdio: "ignore", shell: process.platform === "win32" }
  );

  let failures = 0;
  try {
    await waitForServer();
    console.log("→ Server up. Checking routes…\n");

    for (const [path, okCodes] of Object.entries(ROUTES)) {
      let status = 0;
      try {
        const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
        status = res.status;
      } catch {
        status = -1;
      }
      const pass = okCodes.includes(status);
      if (!pass) failures++;
      console.log(
        `  ${pass ? "✓" : "✗"} ${path.padEnd(22)} → ${status} (expected ${okCodes.join("/")})`
      );
    }
  } finally {
    killServer(server.pid);
  }

  console.log("");
  if (failures > 0) {
    console.error(`✗ Smoke test FAILED: ${failures} route(s) failed.`);
  } else {
    console.log("✓ Smoke test PASSED.");
  }
  // Delay so stdout flushes (process.exit can truncate) and the killed server
  // releases the port before this process ends.
  setTimeout(() => process.exit(failures > 0 ? 1 : 0), 400);
}

/** Kill the server process tree (the npx→node chain on Windows needs /T). */
function killServer(pid: number | undefined) {
  if (!pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    try {
      process.kill(pid);
    } catch {
      /* already gone */
    }
  }
}

main().catch((e) => {
  console.error("Smoke test error:", e);
  process.exit(1);
});
