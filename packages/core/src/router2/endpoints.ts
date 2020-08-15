export function buildEndpoints<C>(config: C) {
    const endpoints: string[] = [];

    function addEndpoints(c: any, root: string) {
        if (Array.isArray(c)) {
            if (!c[1].required) {
                endpoints.push(root);
            }

            root = `${root}/:${c[0]}`;

            if (!Array.isArray(c[2])) {
                endpoints.push(root);
            }

            if (c[2]) {
                addEndpoints(c[2], root);
            }
        } else {
            if (Object.keys(c).length === 0 || Object.values(c).every(i => !Array.isArray(i))) {
                endpoints.push(root);
            }
            for (const key in c) {
                addEndpoints(c[key], `${root}/${key}`);
            }
        }
    }

    endpoints.push("/");
    addEndpoints(config, "");

    return endpoints;
}
