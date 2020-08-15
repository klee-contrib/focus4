import {Param, ParamDef} from "./params";

/** Type décrivant l'objet de valeurs de paramètre d'un routeur de configuration quelconque. */
export type ParamObject<C = any> = C extends ParamDef<infer K1, Param<infer T1>, ParamDef<infer K2, Param<infer T2>>>
    ? Record<K1, T1> & Record<K2, T2>
    : C extends ParamDef<infer A3, Param<infer N3>, infer U>
    ? Record<A3, N3> & {readonly [P in keyof U]: ParamObject<U[P]>}
    : {
          readonly [P in keyof C]: ParamObject<C[P]>;
      };

/** Construit l'objet de valeurs. */
export function buildObject<C>(config: C): ParamObject<C> {
    const object = {} as ParamObject<C>;

    if (Array.isArray(config)) {
        (object as any)[config[0]] = undefined;
        if (config[2]) {
            Object.assign(object, buildObject(config[2]));
        }
    } else {
        for (const key in config) {
            if (config[key] === undefined || buildObject(config[key])) {
                (object as any)[key] = undefined;
            } else {
                (object as any)[key] = buildObject(config[key]);
            }
        }
    }

    return object;
}
