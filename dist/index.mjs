import { mkdirSync, writeFileSync } from "node:fs";
import { join as join$1 } from "node:path";
async function generateSkill(config, onProgress) {
	const { url, outputDir = ".skilld", chunkSize = 1e3, chunkOverlap = 200, maxPages = 100, skipLlmsTxt = false, model = "Xenova/bge-small-en-v1.5" } = config;
	const siteName = getSiteName(url);
	const skillDir = join$1(outputDir, siteName);
	const referencesDir = join$1(skillDir, "references");
	const dbPath = join$1(skillDir, "search.db");
	mkdirSync(referencesDir, { recursive: true });
	let docs;
	let skillContent;
	if (!skipLlmsTxt) {
		const llmsResult = await fetchFromLlmsTxt(url, maxPages, onProgress);
		if (llmsResult) {
			docs = llmsResult.docs;
			skillContent = llmsResult.llmsContent;
		} else docs = await crawlSite(url, maxPages, onProgress);
	} else docs = await crawlSite(url, maxPages, onProgress);
	if (docs.length === 0) throw new Error("No documents found to index");
	const skillPath = join$1(skillDir, "SKILL.md");
	if (skillContent) writeFileSync(skillPath, skillContent);
	const { splitText } = await import("./split-text.mjs");
	const { sqliteVec } = await import("retriv/db/sqlite-vec");
	const { transformers } = await import("retriv/embeddings/transformers");
	const documents = [];
	for (const doc of docs) {
		const chunks = splitText(doc.content, {
			chunkSize,
			chunkOverlap
		});
		for (const chunk of chunks) {
			const section = extractSection(chunk.text);
			const docId = chunks.length > 1 ? `${doc.url}#chunk-${chunk.index}` : doc.url;
			const prefix = [doc.title, section].filter(Boolean).join(" > ");
			const content = prefix ? `${prefix}\n\n${chunk.text}` : chunk.text;
			documents.push({
				id: docId,
				content,
				metadata: {
					source: doc.url,
					title: doc.title,
					...section && { section },
					...chunks.length > 1 && {
						chunkIndex: chunk.index,
						chunkTotal: chunks.length
					}
				}
			});
			writeFileSync(join$1(referencesDir, sanitizeFilename(docId) + ".md"), formatReferenceFile(docId, doc, section, chunk, chunks.length));
		}
	}
	onProgress?.({
		url: "embedding",
		count: documents.length,
		phase: "index"
	});
	const db = await sqliteVec({
		path: dbPath,
		embeddings: transformers({ model })
	});
	await db.index(documents);
	await db.close?.();
	return {
		siteName,
		skillPath,
		referencesDir,
		dbPath,
		chunkCount: documents.length
	};
}
function getSiteName(url) {
	return new URL(url).hostname.replace(/^www\./, "");
}
function sanitizeFilename(id) {
	return id.replace(/^https?:\/\//, "").replace(/[#?]/g, "-").replace(/[^a-z0-9.-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}
function extractSection(text) {
	const headings = [];
	for (const line of text.split("\n")) {
		const match = line.match(/^(#{1,6}) ([^\n]+)$/);
		if (match) {
			const level = match[1].length;
			const heading = match[2].trim();
			headings.length = level - 1;
			headings[level - 1] = heading;
		}
	}
	return headings.filter(Boolean).join(" > ") || void 0;
}
function formatReferenceFile(docId, doc, section, chunk, totalChunks) {
	const frontmatter = [
		"---",
		`id: "${docId}"`,
		`source: "${doc.url}"`,
		`title: "${doc.title}"`
	];
	if (section) frontmatter.push(`section: "${section}"`);
	if (totalChunks > 1) frontmatter.push(`chunk: ${chunk.index + 1}/${totalChunks}`);
	frontmatter.push("---", "");
	const prefix = [doc.title, section].filter(Boolean).join(" > ");
	return frontmatter.join("\n") + (prefix ? `${prefix}\n\n` : "") + chunk.text;
}
async function fetchFromLlmsTxt(baseUrl, maxPages, onProgress) {
	const urlObj = new URL(baseUrl);
	const llmsUrl = `${urlObj.origin}/llms.txt`;
	const res = await fetch(llmsUrl, { headers: { "User-Agent": "skilld/1.0" } }).catch(() => null);
	if (!res?.ok) return null;
	const llmsContent = await res.text();
	if (llmsContent.length < 50) return null;
	const links = parseLinks(llmsContent);
	const docs = [];
	let count = 0;
	for (const { title, url } of links.slice(0, maxPages)) {
		count++;
		onProgress?.({
			url,
			count,
			phase: "fetch"
		});
		const absoluteUrl = url.startsWith("http") ? url : new URL(url, urlObj.origin).href;
		const content = await fetchMarkdown(absoluteUrl);
		if (content && content.length >= 50) docs.push({
			url: absoluteUrl,
			title,
			content
		});
	}
	return {
		docs,
		llmsContent
	};
}
function parseLinks(content) {
	const links = [];
	const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
	let match;
	while ((match = linkRegex.exec(content)) !== null) {
		const [, title, url] = match;
		if (url.includes("/raw/") || url.endsWith(".md")) links.push({
			title,
			url
		});
	}
	return links;
}
async function fetchMarkdown(url) {
	const res = await fetch(url, { headers: { "User-Agent": "skilld/1.0" } }).catch(() => null);
	if (!res?.ok) return null;
	return res.text();
}
async function crawlSite(url, maxPages, onProgress) {
	const { htmlToMarkdown } = await import("mdream");
	const { crawlAndGenerate } = await import("@mdream/crawl");
	const { tmpdir } = await import("node:os");
	const { join } = await import("node:path");
	const docs = [];
	let count = 0;
	const outputDir = join(tmpdir(), `skilld-crawl-${Date.now()}`);
	await crawlAndGenerate({
		urls: [url],
		outputDir,
		maxRequestsPerCrawl: maxPages,
		followLinks: true,
		onPage: async ({ url: pageUrl, html, title }) => {
			count++;
			onProgress?.({
				url: pageUrl,
				count,
				phase: "fetch"
			});
			const markdown = htmlToMarkdown(html, { origin: new URL(pageUrl).origin });
			if (markdown && markdown.length >= 50) docs.push({
				url: pageUrl,
				title: title || pageUrl,
				content: markdown
			});
		}
	});
	return docs;
}
export { generateSkill };

//# sourceMappingURL=index.mjs.map