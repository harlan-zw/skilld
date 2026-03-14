import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "pathe";
import { gt as _semverGt } from "semver";
import { isWindows } from "std-env";

/** Get-or-create for Maps. Polyfill for Map.getOrInsertComputed (not yet in Node.js). */
export function mapInsert<K, V>(map: Map<K, V>, key: K, create: () => V): V {
  let val = map.get(key);
  if (val === undefined) {
    val = create();
    map.set(key, val);
  }
  return val;
}

/** Compare two semver strings: returns true if a > b. Handles prereleases. */
export function semverGt(a: string, b: string): boolean {
  return _semverGt(a, b, true);
}

let _skilldCommand: string | undefined;

/** Resolve the skilld CLI command — returns `skilld` if the binary is in PATH, otherwise `npx -y skilld` */
export function resolveSkilldCommand(): string {
  if (_skilldCommand !== undefined) return _skilldCommand;
  try {
    const lookup = isWindows ? "where" : "which";
    execSync(`${lookup} skilld`, { stdio: "ignore" });
    _skilldCommand = "skilld";
  } catch {
    _skilldCommand = "npx -y skilld";
  }
  return _skilldCommand;
}

export const SHARED_SKILLS_DIR = ".skills";

/** Returns the shared skills directory path if `.skills/` exists at project root, else null */
export function getSharedSkillsDir(cwd: string = process.cwd()): string | null {
  const dir = join(cwd, SHARED_SKILLS_DIR);
  return existsSync(dir) ? dir : null;
}
