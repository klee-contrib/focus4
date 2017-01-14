import * as fs from "fs";
import * as glob from "glob";
import {camelCase, upperFirst} from "lodash";
import * as ts from "typescript";

const appRoot = process.argv[2] || "src";
const testingRoot = process.argv[3] || "autofocus";

const imports =
`/*
    Ce fichier à été généré automatiquement.
    Toute modification sera perdue.
*/
/* tslint:disable */

import * as React from "react";
import {dum, dumClass, test} from "${testingRoot}/testing";`;

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

function isFunction(node: ts.Node): node is ts.FunctionDeclaration {
    return node.kind === ts.SyntaxKind.FunctionDeclaration;
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
    return upperFirst(camelCase(possibleNames[0] !== "index.tsx" ? possibleNames[0].replace(".tsx", "") : possibleNames[1]));
}

function getImport(comp: TestedComponent) {
    const fileName = comp.fileName.replace(".tsx", "").replace("/index", "");
    const srcIndex = fileName.search(appRoot);
    return `import ${comp.importName || comp.name} from "..${fileName.substring(srcIndex + appRoot.length)}";`;
}

glob(`${appRoot}/**/*.tsx`, (_, fileNames) => {
    const program = ts.createProgram(fileNames, {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS});
    const checker = program.getTypeChecker();

    const output: TestedComponent[] = [];

    for (const sourceFile of program.getSourceFiles()) {
        ts.forEachChild(sourceFile, visit);
    }

    const sortedOutput = output.sort((a, b) => a.name > b.name ? 1 : -1);

    fs.writeFileSync(`${appRoot}/__test__/index.tsx`,
`${imports}

${sortedOutput.map(getImport).join("\r\n")}

${sortedOutput.map(c => `test("${c.name}", ${getComponent(c)});`).join("\r\n")}
`);

    function getComponent(c: TestedComponent) {
        return `<${c.name} ${c.props.map(getProp).filter(p => p !== undefined).join(" ")} />`;
    }

    function visit(node: ts.Node) {
        if (node.getSourceFile().isDeclarationFile) {
            return;
        }

        if (isClass(node) && node.modifiers && node.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword) && !node.modifiers.find(m => m.kind === ts.SyntaxKind.AbstractKeyword)) {
            const type = checker.getTypeAtLocation(node);
            if (type && type.getProperties().filter(prop => prop.name === "render").length) {
                const {heritageClauses} = node;
                if (heritageClauses) {
                    const {types} = heritageClauses[0];
                    if (types) {
                        const {typeArguments} = types[0];
                        if (typeArguments) {
                            pushToOutput(node, type, checker.getTypeAtLocation(typeArguments[0]));
                        }
                    }
                }
            }
        } else if (isFunction(node) && node.name && node.name.text[0] === node.name.text[0].toUpperCase() && node.modifiers && node.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword) && node.parameters.length <= 1) {
            const type = checker.getTypeAtLocation(node);
            const callSignature = type.getCallSignatures()[0];
            const returnType = callSignature.getReturnType();
            if (returnType.symbol && (returnType.symbol.name === "Element" || returnType.symbol.name === "ReactElement")) {
                const {parameters} = callSignature;
                if (parameters && parameters[0]) {
                    pushToOutput(node, type, checker.getTypeAtLocation(parameters[0].valueDeclaration!));
                }
            }
        }
    }

    function pushToOutput(node: ts.Node, type: ts.Type, propType: ts.Type) {
        const c = getName(node, type) as TestedComponent;
        c.props = propType
            .getProperties()
            .filter(p => !(p.valueDeclaration && (p.valueDeclaration as ts.ParameterDeclaration).questionToken))
            .sort((a, b) => a.getName() > b.getName() ? 1 : -1);
        output.push(c);
    }

    function getProp(prop: ts.Symbol) {
        return prop.valueDeclaration && getPropFromType(checker.getTypeAtLocation(prop.valueDeclaration), prop.getName());
    }

    function getPropFromType(type: ts.Type, name: string): string {
        if (isUnion(type)) {
            return getPropFromType(type.types[0], name);
        }

        const typeName = checker.typeToString(type);
        if (["any", "boolean", "number", "string"].find(x => x === typeName)) {
            return `${name}={dum.${typeName}}`;
        }

        if (type.flags === ts.TypeFlags.StringLiteral) {
            return `${name}=${typeName}`;
        }

        if (type.flags === ts.TypeFlags.BooleanLiteral || type.flags === ts.TypeFlags.NumberLiteral || type.flags === ts.TypeFlags.EnumLiteral) {
            return `${name}={${typeName}}`;
        }

        if (type.getCallSignatures().length || type.symbol && type.symbol.name === "Function") {
            return `${name}={dum.function}`;
        }

        if (type.getNumberIndexType()) {
            return `${name}={[]}`;
        }

        const constructSignatures = type.getConstructSignatures();
        if (constructSignatures.length && constructSignatures[0].getReturnType().getProperties().filter(p => p.name === "render").length) {
            return `${name}={dum.component}`;
        }

        if ((type as ts.ObjectType).objectFlags & ts.ObjectFlags.Anonymous || (type as ts.ObjectType).objectFlags & ts.ObjectFlags.Interface) {
            return `${name}={{${
                type.getProperties()
                    .filter(p => !(p.valueDeclaration && (p.valueDeclaration as ts.ParameterDeclaration).questionToken))
                    .map(getProp).filter(p => p !== undefined).map(p => p!.replace(/={(.+)}/, ": $1")).join(", ")
            }}}`;
        }

        if ((type as ts.ObjectType).objectFlags & ts.ObjectFlags.Class || (type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference) {
            return `${name}={dumClass.${typeName.replace(/<(.+)>/, "")}}`;
        }

        return `${name}={dum.any}`;
    }
});
