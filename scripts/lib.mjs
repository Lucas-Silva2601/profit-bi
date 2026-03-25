import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const PID_FILE = path.join(ROOT, ".app.pid");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Registro de PID
// ---------------------------------------------------------------------------

export function readPid() {
  if (!existsSync(PID_FILE)) return null;
  const pid = Number(readFileSync(PID_FILE, "utf8").trim());
  return Number.isInteger(pid) && pid > 0 ? pid : null;
}

function writePid(pid) {
  writeFileSync(PID_FILE, String(pid), "utf8");
}

function clearPid() {
  try {
    unlinkSync(PID_FILE);
  } catch {
    /* já removido */
  }
}

export function isProcessRunning(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // EPERM = processo existe, mas sem permissão para sinalizar
    return err.code === "EPERM";
  }
}

/** Mata o processo e toda a árvore de filhos (Next + workers). */
export function killTree(pid) {
  if (!pid) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }

  // POSIX: o dev server é iniciado como líder de grupo (detached)
  const signal = (sig) => {
    try {
      process.kill(-pid, sig);
    } catch {
      try {
        process.kill(pid, sig);
      } catch {
        /* processo já encerrado */
      }
    }
  };

  signal("SIGTERM");
  const timer = setTimeout(() => signal("SIGKILL"), 4000);
  timer.unref?.();
}

// ---------------------------------------------------------------------------
// Navegador
// ---------------------------------------------------------------------------

export function openBrowser(url) {
  const [cmd, args] =
    process.platform === "win32"
      ? ["cmd", ["/c", "start", "", url]]
      : process.platform === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];

  try {
    const child = spawn(cmd, args, {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.on("error", () => {});
    child.unref();
  } catch {
    /* sem navegador disponível — o link continua impresso no terminal */
  }
}

// ---------------------------------------------------------------------------
// Stop
// ---------------------------------------------------------------------------

export async function stopApp({ quiet = false } = {}) {
  const pid = readPid();

  if (!pid) {
    if (!quiet) {
      console.log(
        "[stop] Nenhuma instância registrada — a aplicação não está rodando.",
      );
    }
    return false;
  }

  if (!isProcessRunning(pid)) {
    clearPid();
    if (!quiet) {
      console.log(
        `[stop] O processo ${pid} não existe mais (registro antigo removido).`,
      );
    }
    return false;
  }

  if (!quiet) console.log(`[stop] Encerrando a aplicação (PID ${pid})...`);
  killTree(pid);

  for (let i = 0; i < 40; i++) {
    if (!isProcessRunning(pid)) break;
    await sleep(250);
  }

  clearPid();
  if (!quiet) console.log("[stop] Aplicação encerrada.");
  return true;
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

function resolveNextBin() {
  const candidates = [
    path.join(ROOT, "node_modules", "next", "dist", "bin", "next"),
    path.join(ROOT, "node_modules", "next", "dist", "bin", "next.js"),
  ];
  const found = candidates.find((file) => existsSync(file));
  if (!found) {
    throw new Error(
      "Next.js não encontrado em node_modules. Rode `npm install` primeiro.",
    );
  }
  return found;
}

async function isUrlUp(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(2000) });
    return true;
  } catch {
    return false;
  }
}

/**
 * Sobe o ambiente de desenvolvimento (next dev) e abre o navegador
 * automaticamente assim que o servidor estiver pronto.
 */
export function startApp() {
  const running = readPid();
  if (running && isProcessRunning(running)) {
    console.log(
      `[start] A aplicação já está rodando (PID ${running}).\n` +
        "        Use `npm run app:restart` para reiniciar ou `npm run app:stop` para encerrar.",
    );
    return;
  }
  if (running) clearPid();

  const nextBin = resolveNextBin();
  console.log("[start] Iniciando Profit BI em modo desenvolvimento...");

  const child = spawn(process.execPath, [nextBin, "dev"], {
    cwd: ROOT,
    stdio: ["inherit", "pipe", "pipe"],
    // POSIX: líder de grupo para permitir encerrar toda a árvore de processos
    detached: process.platform !== "win32",
  });

  if (!child.pid) {
    console.error("[start] Falha ao iniciar o processo do Next.js.");
    process.exitCode = 1;
    return;
  }

  writePid(child.pid);

  let browserOpened = false;
  const open = (url) => {
    if (browserOpened) return;
    browserOpened = true;
    if (process.env.APP_NO_BROWSER === "1") {
      console.log(`\n[start] Servidor pronto em ${url} (abertura do navegador desativada).\n`);
      return;
    }
    console.log(`\n[start] Abrindo ${url} no navegador...\n`);
    openBrowser(url);
  };

  // Detecta a URL real no output do Next (a porta pode variar se 3000 estiver ocupada)
  let buffer = "";
  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);
    buffer += text;
    const match = buffer.match(/https?:\/\/localhost:(\d+)/);
    if (match) open(`http://localhost:${match[1]}`);
  });

  child.stderr.on("data", (chunk) => process.stderr.write(chunk));

  // Fallback: se nada for detectado em 25s, tenta a porta padrão
  const fallback = setTimeout(async () => {
    if (browserOpened) return;
    const url = `http://localhost:${process.env.PORT || "3000"}`;
    if (await isUrlUp(url)) open(url);
  }, 25_000);
  fallback.unref?.();

  const cleanup = () => {
    clearTimeout(fallback);
    clearPid();
  };

  const shutdown = () => {
    killTree(child.pid);
    cleanup();
    process.exit(0);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  process.once("SIGHUP", shutdown);

  child.on("exit", (code) => {
    cleanup();
    process.exit(code ?? 0);
  });

  child.on("error", (err) => {
    cleanup();
    console.error(`[start] Erro ao executar o Next.js: ${err.message}`);
    process.exit(1);
  });
}
