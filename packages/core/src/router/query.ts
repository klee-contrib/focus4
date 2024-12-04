export interface QueryParamConfig {
    [key: string]: "boolean" | "number" | "string";
}

export type QueryParams<T extends QueryParamConfig> = {
    [P in keyof T]?: T[P] extends "string"
        ? string
        : T[P] extends "number"
        ? number
        : T[P] extends "boolean"
        ? boolean
        : never;
};

export function buildQueryMap<Q extends QueryParamConfig>(query: Q, object: QueryParams<Q>) {
    const map = {} as Record<keyof Q, (value: string | undefined) => boolean | number | string | undefined>;

    for (const key in query) {
        const setter = (value: string | undefined) => {
            const newValue =
                value === undefined
                    ? undefined
                    : query[key] === "number"
                    ? parseFloat(value)
                    : query[key] === "boolean"
                    ? value === "true"
                        ? true
                        : value === "false"
                        ? false
                        : Number.NaN
                    : value;
            (object as any)[key] = newValue;
            return newValue;
        };

        map[key] = setter;
    }

    return map;
}

export function buildQueryString(query: Record<string, boolean | number | string | undefined>) {
    return Object.keys(query).reduce(
        (acc, qp) =>
            query[qp] === undefined ? acc : `${acc + (acc === "" ? "?" : "&")}${qp}=${encodeURIComponent(query[qp])}`,
        ""
    );
}

export function parseSearchString(query: string) {
    return query
        .replace(/(^\?)/, "")
        .split("&")
        .reduce((obj: {[key: string]: any}, currentPair) => {
            const pair = currentPair.split("=");
            obj[pair[0]] = pair[1];

            return obj;
        }, {});
}
