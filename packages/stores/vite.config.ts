import {defineConfig} from "vite";

import {decorators} from "@focus4/tooling";

export default defineConfig({
    plugins: [decorators()]
});
