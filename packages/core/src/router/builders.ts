import {Param, ParamDef} from "./param";

/** Type décrivant l'objet de valeurs de paramètre d'un routeur de configuration quelconque. */
export type ParamObject<C = any> = C extends ParamDef<infer K1, Param<infer T1>, ParamDef<infer K2, Param<infer T2>>>
    ? Record<K1, T1> & Record<K2, T2>
    : C extends ParamDef<infer A3, Param<infer N3>, infer U>
    ? Record<A3, N3> & {readonly [P in keyof U]: ParamObject<U[P]>}
    : {
          readonly [P in keyof C]: ParamObject<C[P]>;
      };

/**
 * Construit la liste des endpoints du routeur.
 * @param config Config du routeur.
 */
export function buildEndpoints<C>(config: C) {
    const endpoints: string[] = [];

    function addEndpoints(c: any, root: string) {
        if (Array.isArray(c)) {
            if (!c[1].required) {
                endpoints.push(root);
            }

            root = `${root}/:${c[0] as string}`;

            if (!Array.isArray(c[2])) {
                endpoints.push(root);
            }

            if (c[2]) {
                addEndpoints(c[2], root);
            }
        } else {
            endpoints.push(root);
            for (const key in c) {
                addEndpoints(c[key], `${root}/${key}`);
            }
        }
    }

    endpoints.push("/");
    addEndpoints(config, "");

    return endpoints;
}

/**
 * Construit la map de setters des paramètres du routeur.
 * @param config Config du routeur.
 * @param object Object de paramètres pré-construit.
 * @param params Pour récursion.
 */
export function buildParamsMap<C>(
    config: C,
    object: ParamObject<C>,
    params: Record<string, (value: string | undefined) => number | string | undefined> = {}
) {
    if (Array.isArray(config)) {
        const setter = (value: string | undefined) => {
            const newValue = config[1].type === "number" && value !== undefined ? parseFloat(value) : value;
            (object as any)[config[0]] = newValue;
            return newValue;
        };

        if (params[config[0]]) {
            const existing = params[config[0]];
            params[config[0]] = value => {
                existing(value);
                setter(value);
                return value;
            };
        } else {
            params[config[0]] = setter;
        }

        if (config[2]) {
            buildParamsMap(config[2], object, params);
        }
    } else {
        for (const key in config) {
            buildParamsMap(config[key], (object as any)[key], params);
        }
    }

    return params;
}
