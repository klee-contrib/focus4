import {constants} from "node:fs";
import {access, mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {afterEach, describe, expect, test} from "vitest";

import {generateCSSTypings, loadCSS} from "../index";

const tempDirs: string[] = [];

async function createTempDir() {
    const dir = await mkdtemp(path.join(tmpdir(), "focus4-generator-"));
    tempDirs.push(dir);
    return dir;
}

async function fileExists(filePath: string) {
    try {
        await access(filePath, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

afterEach(async () => {
    if (tempDirs.length) {
        await Promise.all(tempDirs.splice(0).map(dir => rm(dir, {recursive: true, force: true})));
    }
});

describe("loadCSS", () => {
    test("extrait les tokens exportés", async () => {
        const css = `
:export {
  button: button;
  button--primary: buttonPrimary;
  nav-bar: navBar;
}
`;

        const tokens = await loadCSS(css);

        expect(tokens).toEqual(["button", "button--primary", "nav-bar"]);
    });
});

describe("generateCSSTypings", () => {
    test("génère un fichier de typings avec les éléments et modificateurs", async () => {
        const root = await createTempDir();
        const cssPath = path.join(root, "styles.css");
        await writeFile(
            cssPath,
            `
:export {
  button: button;
  button--primary: buttonPrimary;
  nav-bar: navBar;
}

.button { color: red; }
`
        );

        await generateCSSTypings(root);

        const dtsContent = await readFile(`${cssPath}.d.ts`, "utf8");

        expect(dtsContent).toContain('import {CSSElement, CSSMod} from "@focus4/styling";');
        expect(dtsContent).toContain("interface Button { _");
        expect(dtsContent).toContain("interface NavBar { _");
        expect(dtsContent).toContain("export interface StylesCss");
        expect(dtsContent).toContain("button: CSSElement<Button>;");
        expect(dtsContent).toContain('"button--primary": CSSMod<"primary", Button>;');
        expect(dtsContent).toContain('"nav-bar": CSSElement<NavBar>;');
        expect(dtsContent).toContain("declare const stylesCss: StylesCss;");
    });

    test("ignore les fichiers sans exports ou ne correspondant pas au filtre", async () => {
        const root = await createTempDir();
        const included = path.join(root, "keep.css");
        const ignored = path.join(root, "skip.css");
        const noExports = path.join(root, "no-exports.css");

        await writeFile(
            included,
            `
:export {
  title: title;
}
`
        );
        await writeFile(
            ignored,
            `
:export {
  ignored: ignored;
}
`
        );
        await writeFile(
            noExports,
            `
.container { color: blue; }
`
        );

        await generateCSSTypings(root, /keep/);

        expect(await fileExists(`${included}.d.ts`)).toBe(true);
        expect(await fileExists(`${ignored}.d.ts`)).toBe(false);
        expect(await fileExists(`${noExports}.d.ts`)).toBe(false);

        const includedContent = await readFile(`${included}.d.ts`, "utf8");
        expect(includedContent).toContain("export interface KeepCss");
        expect(includedContent).toContain("title: CSSElement<Title>;");
    });
});
