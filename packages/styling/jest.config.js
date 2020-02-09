module.exports = {
    globals: {
        "ts-jest": {
            tsConfig: {
                module: "commonjs",
                esModuleInterop: true
            }
        }
    },
    preset: "ts-jest",
    reporters: ["default", "jest-junit"],
    testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
    verbose: true,
    moduleNameMapper: {
        "@focus4/core": "<rootDir>/../../core/src/focus4.core.ts"
    },
    rootDir: "src"
};
