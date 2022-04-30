module.exports = {
    globals: {
        "ts-jest": {
            diagnostics: {
                ignoreCodes: ["TS2305", "TS2614", "TS2307", "TS7016"]
            },
            tsconfig: {
                module: "commonjs",
                esModuleInterop: true
            }
        }
    },
    preset: "ts-jest",
    reporters: ["default", "jest-junit"],
    testEnvironment: "jsdom",
    testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
    verbose: true,
    moduleNameMapper: {
        "\\.(css|less)$": "identity-obj-proxy",
        "@focus4/core": "<rootDir>/../../core/src/focus4.core.ts",
        "@focus4/stores": "<rootDir>/../../stores/src/focus4.stores.ts",
        "@focus4/styling": "<rootDir>/../../styling/src/focus4.styling.ts",
        "@focus4/toolbox": "<rootDir>/../../toolbox/src/focus4.toolbox.ts"
    },
    rootDir: "src"
};
