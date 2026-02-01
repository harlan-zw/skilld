//#region src/npm.d.ts
/**
 * NPM package discovery and documentation resolution
 */
interface NpmPackageInfo {
  name: string;
  version?: string;
  description?: string;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
    directory?: string;
  };
  readme?: string;
}
interface ResolvedPackage {
  name: string;
  version?: string;
  description?: string;
  docsUrl?: string;
  llmsUrl?: string;
  readmeUrl?: string;
  repoUrl?: string;
}
/**
 * Fetch package info from npm registry
 */
declare function fetchNpmPackage(packageName: string): Promise<NpmPackageInfo | null>;
/**
 * Resolve documentation URL for a package
 */
declare function resolvePackageDocs(packageName: string): Promise<ResolvedPackage | null>;
interface LocalDependency {
  name: string;
  version: string;
}
/**
 * Read package.json dependencies with versions
 */
declare function readLocalDependencies(cwd: string): Promise<LocalDependency[]>;
/**
 * Get installed skill version from SKILL.md
 */
declare function getInstalledSkillVersion(skillDir: string): Promise<string | null>;
//#endregion
export { LocalDependency, NpmPackageInfo, ResolvedPackage, fetchNpmPackage, getInstalledSkillVersion, readLocalDependencies, resolvePackageDocs };
//# sourceMappingURL=npm.d.mts.map