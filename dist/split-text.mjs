const MARKDOWN_SEPARATORS = [
	"\n## ",
	"\n### ",
	"\n#### ",
	"\n##### ",
	"\n###### ",
	"```\n\n",
	"\n\n***\n\n",
	"\n\n---\n\n",
	"\n\n___\n\n",
	"\n\n",
	"\n",
	" ",
	""
];
function offsetToLine(text, offset) {
	let line = 1;
	for (let i = 0; i < offset && i < text.length; i++) if (text[i] === "\n") line++;
	return line;
}
function splitText(text, options = {}) {
	const { chunkSize = 1e3, chunkOverlap = 200, separators = MARKDOWN_SEPARATORS } = options;
	if (text.length <= chunkSize) {
		const endLine = offsetToLine(text, text.length);
		return [{
			text,
			index: 0,
			range: [0, text.length],
			lines: [1, endLine]
		}];
	}
	return mergeChunks(splitRecursive(text, chunkSize, separators), chunkSize, chunkOverlap, text);
}
function splitRecursive(text, chunkSize, separators) {
	if (text.length <= chunkSize || separators.length === 0) return [text];
	const separator = separators.find((sep) => sep === "" || text.includes(sep));
	if (!separator && separator !== "") return [text];
	const parts = separator === "" ? [...text] : text.split(separator);
	const results = [];
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		const withSep = i < parts.length - 1 && separator !== "" ? part + separator : part;
		if (withSep.length <= chunkSize) results.push(withSep);
		else {
			const subParts = splitRecursive(withSep, chunkSize, separators.slice(1));
			results.push(...subParts);
		}
	}
	return results;
}
function mergeChunks(parts, chunkSize, chunkOverlap, originalText) {
	const chunks = [];
	let current = "";
	let currentStart = 0;
	for (const part of parts) if (current.length + part.length <= chunkSize) current += part;
	else {
		if (current) {
			const start = originalText.indexOf(current, currentStart);
			const actualStart = start >= 0 ? start : currentStart;
			const actualEnd = actualStart + current.length;
			chunks.push({
				text: current,
				index: chunks.length,
				range: [actualStart, actualEnd],
				lines: [offsetToLine(originalText, actualStart), offsetToLine(originalText, actualEnd)]
			});
			currentStart = Math.max(0, actualStart + current.length - chunkOverlap);
		}
		if (chunkOverlap > 0 && current.length > chunkOverlap) current = current.slice(-chunkOverlap) + part;
		else current = part;
	}
	if (current) {
		const start = originalText.indexOf(current, currentStart);
		const actualStart = start >= 0 ? start : currentStart;
		const actualEnd = start >= 0 ? start + current.length : originalText.length;
		chunks.push({
			text: current,
			index: chunks.length,
			range: [actualStart, actualEnd],
			lines: [offsetToLine(originalText, actualStart), offsetToLine(originalText, actualEnd)]
		});
	}
	return chunks;
}
export { splitText };

//# sourceMappingURL=split-text.mjs.map