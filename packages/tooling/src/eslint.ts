import eslint from "@eslint/js";
// @ts-ignore
import prettier from "eslint-config-prettier";
// @ts-ignore
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";

import "eslint-plugin-only-warn";

export const eslintConfig = tseslint.config(
    {
        settings: {
            "import/internal-regex": "^@focus4/",
            react: {
                version: "detect"
            }
        },
        languageOptions: {
            parserOptions: {
                project: "tsconfig.json",
                sourceType: "module"
            }
        }
    },
    eslint.configs.all,
    tseslint.configs.all,
    react.configs.flat.all,
    prettier,
    {
        plugins: {
            import: importPlugin.flatConfigs.errors.plugins.import
        },
        rules: {
            "block-spacing": "off",
            camelcase: [
                "warn",
                {
                    allow: ["UNSAFE_componentWillMount", "UNSAFE_componentWillReceiveProps"]
                }
            ],
            "class-methods-use-this": "off",
            complexity: "off",
            "consistent-return": "off",
            "consistent-this": "off",
            "default-case": "off",
            "func-style": [
                "warn",
                "declaration",
                {
                    allowArrowFunctions: true
                }
            ],
            "guard-for-in": "off",
            "id-length": "off",
            "linebreak-style": ["warn", "windows"],
            "line-comment-position": "off",
            "no-case-declarations": "off",
            "no-underscore-dangle": "off",
            "max-classes-per-file": "off",
            "max-depth": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            "new-cap": "off",
            "no-await-in-loop": "off",
            "no-bitwise": "off",
            "no-console": [
                "warn",
                {
                    allow: ["info", "warn", "error"]
                }
            ],
            "no-constant-condition": [
                "warn",
                {
                    checkLoops: false
                }
            ],
            "no-continue": "off",
            "no-else-return": "off",
            "no-implicit-coercion": "off",
            "no-inline-comments": "off",
            "no-negated-condition": "off",
            "no-nested-ternary": "off",
            "no-param-reassign": "off",
            "no-plusplus": "off",
            "no-prototype-builtins": "off",
            "no-ternary": "off",
            "no-undefined": "off",
            "no-useless-return": "off",
            "one-var": ["warn", "never"],
            "prefer-arrow-callback": "off",
            "prefer-destructuring": "off",
            "prefer-named-capture-group": "off",
            "quote-props": ["warn", "as-needed"],
            radix: "off",
            "require-atomic-updates": "off",
            "require-unicode-regexp": "off",
            "sort-keys": "off",
            "sort-imports": [
                "warn",
                {
                    ignoreDeclarationSort: true,
                    ignoreCase: true
                }
            ],
            "spaced-comment": [
                "warn",
                "always",
                {
                    markers: ["/", "//"]
                }
            ],
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/block-spacing": "off",
            "@typescript-eslint/class-literal-property-style": "off",
            "@typescript-eslint/class-methods-use-this": "off",
            "@typescript-eslint/consistent-indexed-object-style": "off",
            "@typescript-eslint/consistent-return": "off",
            "@typescript-eslint/consistent-type-exports": "off",
            "@typescript-eslint/consistent-type-imports": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-member-accessibility": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/init-declarations": "off",
            "@typescript-eslint/max-params": "off",
            "@typescript-eslint/member-ordering": "off",
            "@typescript-eslint/method-signature-style": "off",
            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    selector: "default",
                    filter: {
                        regex: "^UNSAFE_",
                        match: false
                    },
                    format: ["camelCase", "PascalCase"],
                    leadingUnderscore: "allow"
                },
                {
                    selector: "enumMember",
                    format: ["PascalCase"]
                },
                {
                    selector: "objectLiteralMethod",
                    format: null
                },
                {
                    selector: "objectLiteralProperty",
                    format: null
                },
                {
                    selector: "typeLike",
                    format: ["PascalCase"],
                    leadingUnderscore: "allow"
                },
                {
                    selector: "variable",
                    format: ["camelCase", "PascalCase", "UPPER_CASE"]
                }
            ],
            "@typescript-eslint/no-confusing-void-expression": "off",
            "@typescript-eslint/no-dynamic-delete": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-import-type-side-effects": "off",
            "@typescript-eslint/no-invalid-void-type": "off",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-redundant-type-constituents": "off",
            "@typescript-eslint/no-this-alias": [
                "warn",
                {
                    allowDestructuring: true,
                    allowedNames: ["self", "that"]
                }
            ],
            "@typescript-eslint/no-type-alias": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unnecessary-type-parameters": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-type-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/prefer-destructuring": [
                "warn",
                {
                    array: false,
                    object: true
                }
            ],
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
            "@typescript-eslint/prefer-reduce-type-parameter": "off",
            "@typescript-eslint/prefer-return-this-type": "off",
            "@typescript-eslint/prefer-ts-expect-error": "off",
            "@typescript-eslint/promise-function-async": "off",
            "@typescript-eslint/require-array-sort-compare": [
                "warn",
                {
                    ignoreStringArrays: true
                }
            ],
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/return-await": "off",
            "@typescript-eslint/sort-type-union-intersection-members": "off",
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/switch-exhaustiveness-check": "off",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/unified-signatures": "off",
            "import/order": [
                "warn",
                {
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true
                    },
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
                    "newlines-between": "always",
                    pathGroups: [
                        {
                            pattern:
                                "{.,..,../..,../../..,../../../..,../../../../..,../../../../../..}/{model,services,stores}/**",
                            group: "parent",
                            position: "before"
                        },
                        {
                            pattern: "*.css",
                            patternOptions: {
                                matchBase: true
                            },
                            group: "type",
                            position: "after"
                        }
                    ]
                }
            ],
            "react/destructuring-assignment": "off",
            "react/display-name": "off",
            "react/forbid-component-props": "off",
            "react/hook-use-state": "off",
            "react/jsx-filename-extension": [
                "warn",
                {
                    extensions: [".tsx"]
                }
            ],
            "react/jsx-handler-names": "off",
            "react/jsx-max-depth": "off",
            "react/jsx-max-props-per-line": "off",
            "react/jsx-newline": "off",
            "react/jsx-no-bind": "off",
            "react/jsx-no-literals": "off",
            "react/jsx-no-target-blank": "off",
            "react/jsx-one-expression-per-line": "off",
            "react/jsx-props-no-spreading": "off",
            "react/jsx-sort-props": [
                "warn",
                {
                    reservedFirst: true,
                    ignoreCase: true
                }
            ],
            "react/no-array-index-key": "off",
            "react/no-deprecated": "off",
            "react/no-multi-comp": "off",
            "react/no-object-type-as-default-prop": "off",
            "react/no-set-state": "off",
            "react/no-unescaped-entities": "off",
            "react/no-unsafe": "off",
            "react/no-unstable-nested-components": "off",
            "react/no-unused-class-component-methods": "off",
            "react/no-unused-prop-types": "off",
            "react/prefer-read-only-props": "off",
            "react/prop-types": "off",
            "react/react-in-jsx-scope": "off",
            "react/require-default-props": "off",
            "react/require-optimization": "off",
            "react/sort-comp": [
                "warn",
                {
                    order: [
                        "static-variables",
                        "static-methods",
                        "instance-variables",
                        "lifecycle",
                        "getters",
                        "setters",
                        "everything-else",
                        "render"
                    ]
                }
            ],
            "react/static-property-placement": "off"
        }
    }
);
