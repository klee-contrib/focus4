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
    setupFilesAfterEnv: ["jest-enzyme"],
    snapshotSerializers: ["enzyme-to-json/serializer"],
    testEnvironment: "enzyme",
    testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
    verbose: true,
    moduleNameMapper: {
        "\\.(css|less)$": "identity-obj-proxy",
        "@focus4/core": "<rootDir>/../../core/src/focus4.core.ts",
        "@focus4/stores": "<rootDir>/../../stores/src/focus4.stores.ts",
        "@focus4/styling": "<rootDir>/../../styling/src/focus4.styling.ts"
    },
    rootDir: "src"
};
