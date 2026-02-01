async function fetchNpmPackage(packageName) {
	const res = await fetch(`https://registry.npmjs.org/${packageName}/latest`, { headers: { "User-Agent": "skilld/1.0" } }).catch(() => null);
	if (!res?.ok) return null;
	return res.json();
}
async function resolvePackageDocs(packageName) {
	const pkg = await fetchNpmPackage(packageName);
	if (!pkg) return null;
	const result = {
		name: pkg.name,
		version: pkg.version,
		description: pkg.description
	};
	if (pkg.repository?.url) result.repoUrl = pkg.repository.url.replace(/^git\+/, "").replace(/\.git$/, "").replace(/^git:\/\//, "https://").replace(/^ssh:\/\/git@github\.com/, "https://github.com");
	if (pkg.homepage && !isGitHubRepoUrl(pkg.homepage)) result.docsUrl = pkg.homepage;
	if (result.repoUrl?.includes("github.com")) {
		const match = result.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
		if (match) {
			const owner = match[1];
			const repo = match[2];
			const subdir = pkg.repository?.directory;
			if (!result.docsUrl) {
				const repoMeta = await fetchGitHubRepoMeta(owner, repo);
				if (repoMeta?.homepage) result.docsUrl = repoMeta.homepage;
			}
			const unghUrl = subdir ? `https://ungh.cc/repos/${owner}/${repo}/files/main/${subdir}/README.md` : `https://ungh.cc/repos/${owner}/${repo}/readme`;
			if ((await fetch(unghUrl, { headers: { "User-Agent": "skilld/1.0" } }).catch(() => null))?.ok) result.readmeUrl = `ungh://${owner}/${repo}${subdir ? `/${subdir}` : ""}`;
			else {
				const basePath = subdir ? `${subdir}/` : "";
				for (const branch of ["main", "master"]) {
					const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${basePath}README.md`;
					if (await verifyUrl(readmeUrl)) {
						result.readmeUrl = readmeUrl;
						break;
					}
				}
			}
		}
	}
	if (result.docsUrl) {
		const llmsUrl = `${result.docsUrl.replace(/\/$/, "")}/llms.txt`;
		if (await verifyUrl(llmsUrl)) result.llmsUrl = llmsUrl;
	}
	if (!result.docsUrl && !result.llmsUrl && !result.readmeUrl) return null;
	return result;
}
async function readLocalDependencies(cwd) {
	const { readFileSync, existsSync } = await import("node:fs");
	const { join } = await import("node:path");
	const pkgPath = join(cwd, "package.json");
	if (!existsSync(pkgPath)) throw new Error("No package.json found in current directory");
	const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
	const deps = {
		...pkg.dependencies,
		...pkg.devDependencies
	};
	return Object.entries(deps).filter(([name]) => !name.startsWith("@types/") && ![
		"typescript",
		"eslint",
		"prettier",
		"vitest",
		"jest"
	].includes(name)).map(([name, version]) => ({
		name,
		version: version.replace(/^[\^~>=<]/, "")
	}));
}
async function getInstalledSkillVersion(skillDir) {
	const { readFileSync, existsSync } = await import("node:fs");
	const { join } = await import("node:path");
	const skillPath = join(skillDir, "SKILL.md");
	if (!existsSync(skillPath)) return null;
	return readFileSync(skillPath, "utf-8").match(/^version:\s*"?([^"\n]+)"?/m)?.[1] || null;
}
async function fetchGitHubRepoMeta(owner, repo) {
	const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: { "User-Agent": "skilld/1.0" } }).catch(() => null);
	if (!res?.ok) return null;
	const data = await res.json().catch(() => null);
	return data?.homepage ? { homepage: data.homepage } : null;
}
function isGitHubRepoUrl(url) {
	try {
		const parsed = new URL(url);
		return parsed.hostname === "github.com" || parsed.hostname === "www.github.com";
	} catch {
		return false;
	}
}
async function verifyUrl(url) {
	const res = await fetch(url, {
		method: "HEAD",
		headers: { "User-Agent": "skilld/1.0" }
	}).catch(() => null);
	if (!res?.ok) return false;
	return !(res.headers.get("content-type") || "").includes("text/html");
}
export { fetchNpmPackage, getInstalledSkillVersion, readLocalDependencies, resolvePackageDocs };

//# sourceMappingURL=npm.mjs.map