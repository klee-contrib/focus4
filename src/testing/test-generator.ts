import * as ts from "typescript";
import * as fs from "fs";
import glob = require("glob");
import pascalCase = require("pascal-case");

const imports =
`import * as React from "react";
import {test, dum} from "./src/testing/base-test";`;

interface NamedComponent {
    fileName: string;
    importName?: string;
    name?: string;
}

interface TestedComponent extends NamedComponent {
    props: ts.Symbol[];
}

function isClass(node: ts.Node): node is ts.ClassDeclaration {
    return node.kind === ts.SyntaxKind.ClassDeclaration;
}

function isUnion(type: ts.Type): type is ts.UnionType {
    return (type.flags & ts.TypeFlags.Union) !== 0;
}

function getName(node: ts.Node, type: ts.Type): NamedComponent {
    const symbolName = type.symbol && type.symbol.name;
    const fileName = node.getSourceFile().fileName;
    if (symbolName === "default") {
        return {name: getDefaultName(fileName), fileName};
    } else {
        return {name: symbolName, importName: `{${symbolName}}`, fileName};
    }
}

function getDefaultName(fileName: string) {
    const possibleNames = fileName.split("/").reverse();
    return pascalCase(possibleNames[0] !== "index.tsx" ? possibleNames[0].replace(".tsx", "") : possibleNames[1]);
}

function getImport(comp: TestedComponent) {
    const fileName = comp.fileName.replace(".tsx", "").replace("/index", "");
    const srcIndex = fileName.search("src");
    return `import ${comp.importName || comp.name} from "./${fileName.substring(srcIndex)}";`;
}

glob("src/**/*.tsx", (error, fileNames) => {
    const program = ts.createProgram(fileNames, {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS});
    const checker = program.getTypeChecker();

    const output: TestedComponent[] = [];

    for (const sourceFile of program.getSourceFiles()) {
        ts.forEachChild(sourceFile, visit);
    }

    const sortedOutput = output.sort((a, b) => a.name > b.name ? 1 : -1);

    fs.writeFileSync("tests_generated.tsx",
`${imports}

${sortedOutput.map(getImport).join("\r\n")}

${sortedOutput.map(c => `test("${c.name}", <${c.name} ${c.props.map(getProp).join(" ")} />);`).join("\r\n")}
`);

    function visit(node: ts.Node) {
        if (isClass(node) && (!node.modifiers || !node.modifiers.find(m => m.kind === ts.SyntaxKind.AbstractKeyword))) {
            const type = checker.getTypeAtLocation(node);
            if (type && type.getProperties().filter(prop => prop.name === "render").length) {
                const c = getName(node, type) as TestedComponent;
                c.props = checker.getTypeAtLocation(node.heritageClauses![0].types![0].typeArguments![0])
                    .getProperties()
                    .filter(p => !(p.valueDeclaration as ts.ParameterDeclaration).questionToken)
                    .sort((a, b) => a.getName() > b.getName() ? 1 : -1);
                if (c.name !== "ElementClass") {
                    output.push(c);
                }
            }
        }
    }

    function getProp(prop: ts.Symbol) {
        return getPropFromType(checker.getTypeAtLocation(prop.valueDeclaration!), prop.getName());
    }

    function getPropFromType(type: ts.Type, name: string): string {
        if (isUnion(type)) {
            return getPropFromType(type.types[0], name);
        }

        const typeName = checker.typeToString(type);
        if (["any", "boolean", "number", "string"].find(x => x === typeName)) {
            return `${name}={dum.${typeName}}`;
        }

        if (type.getCallSignatures().length || type.symbol!.name === "Function") {
            return `${name}={dum.function}`;
        }

        if (type.getNumberIndexType()) {
            return `${name}={dum.array}`;
        }

        const constructSignatures = type.getConstructSignatures();
        if (constructSignatures.length && constructSignatures[0].getReturnType().getProperties().filter(p => p.name === "render").length) {
            return `${name}={dum.component}`;
        }

        if (type.flags === ts.TypeFlags.Anonymous || type.flags === ts.TypeFlags.Interface) {
            return `${name}={{${type.getProperties().filter(p => !(p.valueDeclaration as ts.ParameterDeclaration).questionToken).map(getProp).map(p => p.replace(/={(.+)}/, ": $1")).join(", ")}}}`;
        }

        return `${name}={dum.any}`;
    }
});
