module.exports = {
    globals: {
        "ts-jest": {
            tsConfig: {
                module: "commonjs",
                esModuleInterop: true
            }
        }
    },
    moduleNameMapper: {
        "\\.(css|less)$": "identity-obj-proxy"
    },
    preset: "ts-jest",
    reporters: ["default", "jest-junit"],
    setupFilesAfterEnv: ["jest-enzyme"],
    snapshotSerializers: ["enzyme-to-json/serializer"],
    testEnvironment: "enzyme",
    testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
    verbose: true
};
