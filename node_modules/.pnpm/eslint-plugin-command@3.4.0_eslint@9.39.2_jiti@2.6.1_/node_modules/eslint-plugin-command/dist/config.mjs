import { n as createPluginWithCommands, t as src_default } from "./src-CRIhOpyJ.mjs";

//#region src/config.ts
function config(options = {}) {
	const plugin = options.commands ? createPluginWithCommands(options) : src_default;
	const { name = "command" } = options;
	return {
		name,
		plugins: { [name]: plugin },
		rules: { [`${name}/command`]: "error" }
	};
}

//#endregion
export { config as default };