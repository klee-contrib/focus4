import {defineConfig} from "vitest/config";

import {decorators} from "@focus4/tooling";

export default defineConfig({
    plugins: [decorators()],
    test: {
        environment: "jsdom"
    }
});
