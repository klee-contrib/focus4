import {defineConfig} from "vitest/config";

import {cssAutoModules} from "@focus4/tooling";

export default defineConfig({
    plugins: [cssAutoModules(/__style__/)]
});
