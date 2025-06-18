import {createHash} from "node:crypto";
import dns from "node:dns";
import {existsSync, promises as fs} from "node:fs";
import path from "node:path";
import nesting from "postcss-nesting";
import {PluginOption, ResolvedConfig, UserConfigExport} from "vite";

dns.setDefaultResultOrder("verbatim");

export const baseConfig = {
    build: {
        chunkSizeWarningLimit: 5000
    },
    css: {
        modules: {
            generateScopedName(name, filename, css) {
                return `${path.basename(filename).replace(".module.css", "")}_${name}__${createHash("sha1")
                    .update(filename + css)
                    .digest("base64")
                    .replaceAll(/[+/=]/g, "")
                    .slice(0, 5)}`;
            }
        },
        postcss: {plugins: [nesting()]}
    }
} satisfies UserConfigExport;

/**
 * Plugin pour que Vite considère tous les fichiers CSS du projet qui matchent la regex en tant que modules CSS (au lieu de ne gérer que les fichiers en `.module.css`).
 * @param regex Regex pour identifier les modules CSS.
 */
export function cssAutoModules(regex: RegExp): PluginOption {
    let config: ResolvedConfig;

    return {
        name: "css-auto-modules",
        enforce: "pre",
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        resolveId(id, importer) {
            id = id.replace("?used", "");

            if (id.startsWith(".") && id.endsWith(".css") && !id.endsWith(".module.css")) {
                const fixedId = `/${path.relative(
                    config.root,
                    path.resolve(importer ? path.dirname(importer) : "", id)
                )}`.replaceAll("\\", "/");

                if (regex.test(fixedId)) {
                    return fixedId.replace(".css", ".module.css");
                }
            }
        },
        async load(id) {
            id = id.replace("?used", "");

            if (id.endsWith(".module.css") && regex.test(id)) {
                const fileName = config.root + id.replace(".module.css", ".css").replace("?used", "");
                if (existsSync(fileName)) {
                    return (await fs.readFile(fileName)).toString();
                }
            }
        },
        handleHotUpdate(context) {
            if (
                context.modules.length === 0 &&
                context.file.endsWith(".css") &&
                !context.file.endsWith(".module.css")
            ) {
                const id = `/${path
                    .relative(config.root, context.file.replace(".css", ".module.css"))
                    .replaceAll("\\", "/")}`;
                const module = context.server.moduleGraph.getModuleById(id);
                return module ? [module] : [];
            }
        }
    } satisfies PluginOption;
}

/**
 * Plugin Vite pour remplacer les variables SSI (pour nginx par exemple) en mode serveur. Ne fait rien en mode bundle.
 * @param vars Variables à remplacer.
 */
export function ssiVariables(vars: Record<string, string>) {
    return {
        name: "ssi-variables",
        transformIndexHtml(html, ctx) {
            if (!ctx.bundle) {
                return html.replaceAll(/<!--#echo var='(\w+)'-->/g, (_, varName) => vars[varName] ?? "");
            }

            return html;
        }
    } satisfies PluginOption;
}
