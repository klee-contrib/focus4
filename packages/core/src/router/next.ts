interface NumberParam<T extends number = number> {
    type: "number";
    required: boolean;
    spec: T;
}

interface StringParam<T extends string = string> {
    type: "string";
    required: boolean;
    spec: T;
}

type ParamType<T extends string | number> = T extends number
    ? NumberParam<T>
    : T extends string
    ? StringParam<T>
    : never;

type Param<N extends string, T extends NumberParam | StringParam, U = unknown> = [N, T, U?];

type ViewStore<T = any> = T extends Param<infer A, ParamType<infer N>, Param<infer A2, ParamType<infer N2>>>
    ? Record<A, N> & Record<A2, N2>
    : T extends Param<infer A3, ParamType<infer N3>, infer U>
    ? Record<A3, N3> & {[P in keyof U]: ViewStore<U[P]>}
    : {
          [P in keyof T]: ViewStore<T[P]>;
      };

type YoloDab<T> = (T extends Param<infer N0, infer _0, infer U0>
    ? (param: N0) => YoloDab<U0>
    : <D extends keyof T>(
          x: D
      ) => T[D] extends Param<infer _1, infer _2, infer _3>
          ? YoloDab<T[D]>
          : T[D] extends Param<infer _4, infer _5>
          ? void
          : YoloDab<T[D]>) & {lolilol: T};

type YoloDoubleDab<T> = T extends Param<infer _0, ParamType<infer P>, infer U>
    ? (param: P) => YoloDoubleDab<U>
    : <D extends keyof T>(
          x: D
      ) => T[D] extends Param<infer _1, infer _2, infer _3>
          ? YoloDoubleDab<T[D]>
          : T[D] extends Param<infer _4, infer _5>
          ? void
          : YoloDoubleDab<T[D]>;

type Router<T> = ViewStore<T> & {
    is(predicate: (x: YoloDab<T>) => void): boolean;
    to(predicate: (x: YoloDoubleDab<T>) => void): void;
    sub<S>(predicate: (x: YoloDab<T>) => YoloDab<S>): Router<S>;
};

const p = {
    number<T extends number>(required = false): NumberParam<T> {
        return {type: "number", required, spec: {} as T};
    },
    string<T extends string>(required = false): StringParam<T> {
        return {type: "string", required, spec: {} as T};
    },
    param<N extends string, T extends NumberParam | StringParam, U>(name: N, type: T, u?: U): Param<N, T, U> {
        return [name, type, u];
    }
};

function isNumberParam(data: any): data is NumberParam {
    return data.type === "number";
}

function isStringParam(data: any): data is StringParam {
    return data.type === "string";
}

function t() {
    /** */
}

function makeRouter<T>(config: T): Router<T> {
    const store = buildView(config);

    const endpoints: [string, Function][] = [];

    function addEndpoints(c: any, root: string) {
        if (Array.isArray(c)) {
            if (!c[1].required) {
                endpoints.push([root, t]);
            }

            root = `${root}/:${c[0]}`;

            if (!Array.isArray(c[2])) {
                endpoints.push([root, t]);
            }

            if (c[2]) {
                addEndpoints(c[2], root);
            }
        } else {
            if (Object.keys(c).length === 0 || Object.values(c).every(i => !Array.isArray(i))) {
                endpoints.push([root, t]);
            }
            for (const key in c) {
                addEndpoints(c[key], `${root}/${key}`);
            }
        }
    }

    endpoints.push(["/", t]);
    addEndpoints(config, "");

    console.info(endpoints);

    return store as Router<T>;
}

function buildView<T>(config: T): ViewStore<T> {
    const object = {} as ViewStore<T>;

    if (Array.isArray(config)) {
        (object as any)[config[0]] = undefined;
        if (config[2]) {
            Object.assign(object, buildView(config[2]));
        }
    } else {
        for (const key in config) {
            const value = config[key];
            if (value === undefined || isNumberParam(value) || isStringParam(value)) {
                (object as any)[key] = undefined;
            } else {
                (object as any)[key] = buildView(config[key]);
            }
        }
    }

    return object;
}

const echeance = p.param("echId", p.number(), {reglement: p.param("regId", p.number())});

/*
    Le routeur se définit par un "arbre" qui décrit l'ensemble des routes possibles.

    Chaque clé définit une route possible statique, qui peut avoir comme valeur soit un object vide
    (dans ce cas c'est route "feuille"), soit un paramètre (p.param).

    Un paramètre se définit par son nom, son type (number ou string, et son caractère obligatoire),
    ainsi que le reste des routes qui existent derrière, ou bien un autre paramètre.

    Le caractère obligatoire du paramètre autorise ou non la route "précédente" a matcher. Si pas de
    paramètre, alors elle est forcément autorisée (dans l'exemple, /projet et /projet/detail).

    On peut également avoir un paramètre pour racine.

    On peut décomposer la définition des routes si on veut (comme pour "echeance" dans l'exemple).
*/
const router = makeRouter({
    projet: {
        detail: {}
    },
    operation: p.param("ofaId", p.number(), {
        garantie: p.param("gfaId", p.number(true)),
        pret: p.param("pnfId", p.number(true)),
        tam: p.param("ttaCode", p.string<"COURANT" | "THEORIQUE">(true), p.param("mprId", p.number())),
        echeance
    })
});

/*
    La liste des routes possibles pour cette définition est donc :
    '/'
    '/projet'
    '/projet/detail'
    '/operation'
    '/operation/:ofaId'
    '/operation/:ofaId/garantie/:gfaId'
    '/operation/:ofaId/pret/:pnfId'
    '/operation/:ofaId/tam/:ttaCode'
    '/operation/:ofaId/tam/:ttaCode/:mprId'
    '/operation/:ofaId/echeance'
    '/operation/:ofaId/echeance/:echId'
    '/operation/:ofaId/echeance/:echId/reglement'
    '/operation/:ofaId/echeance/:echId/reglement/:regId'

    Le routeur ainsi créé est constitué d'un objet ayant la forme de la configuration et contenant
    toutes les valeurs des différents paramètres qui ont été définis.
*/

router.operation.ofaId = 2;
router.operation.garantie.gfaId = 1;
router.operation.echeance.echId = 1;
router.operation.echeance.reglement.regId = 1;
router.operation.tam.ttaCode = "COURANT";
router.operation.tam.mprId = 3;

/*
    Contrairement au routeur actuel, modifier les valeurs NE NAVIGUE PAS. Et de par sa construction,
    il est impossible de déduire la route courante depuis les valeurs seules.

    Le routeur contient donc un état supplémentaire qui garde la dernière route demandée, qui est donc
    celle qui est active. C'est donc l'une des routes qu'on a définit statiquement tout à l'heure.

    Modifier une valeur d'un paramètre qui est dans la route active mettra simplement à jour l'URL.
    Toute valeur qui n'est pas dans la route actuelle est "undefined" et il ne sera pas possible
    de la renseigner.

    Lorsqu'un navigue vers une URL, la route active est mise à jour ainsi que les valeurs des
    paramètres qui sont contenus dedans.

    Pour déterminer la route active, le routeur publie une méthode "is" qui prend une fonction
    permettant de décrire de façon statiquement typée l'url, élément par élément :
*/

router.is(a => a("operation")("ofaId")("tam")("ttaCode")("mprId"));
router.is(a => a("operation")("ofaId")("echeance")("echId")("reglement")("regId"));

/*
    "is" vérifie que l'URL construite est contenue dans l'URL courante, elle ne vérifie pas une match
    exacte. Par exemple "is(a => a("operation")("ofaId"))" renvoie true pour "/operation/1/echeance/4"

    Cela permet de vérifier qu'on est sur la bonne route et ne dépend pas du tout des valeurs de paramètres.
    Si je veux distinguer entre /operation et /operation/1, je utilise is(a => a("operation")("ofaId"))
    au lieu de vérifier si router.operation.ofaId est undefined.

    Pour naviguer, le routeur dispose d'une méthode "to", qui fonctionne un peu sur le même principe :
*/

router.to(a => a("operation")(1)("tam")("COURANT")(4));
router.to(a => a("operation")(1)("echeance")(4)("reglement")(3));

/*
    "to" remplace le nom des paramètres par leurs valeurs, et bien entendu c'est statiquement typé.
    C'est tout à fait équivalent à faire une navigation vers /operation/1/tam/COURANT/4 et
    /operation/1/echeance/4/reglement/3, et il faut donc nécessairement spécifier les valeurs
    de tous les paramètres.

    Pour éviter d'avoir à utiliser le routeur global dans tous les recoins de l'application, le routeur
    dispose d'une méthode "sub" qui permet de récupérer un sous-routeur qui permet d'accéder à une section
    de la table de routage.
*/

router.sub(a => a("operation")("ofaId")).to(a => a("garantie")(4));

/*
    Ce sous-routeur dispose de la même API que le routeur principal (is/to/sub), mais il n'expose que
    les URLs qui à partir de sa racine dans son objet de valeur et dans "is" et "to".

    Les méthodes fonctionnent de la même façon, en complétant les URLs construite avec la partie commune
    définie dans le "sub".

    Pour les paramètres précédants le sous-routeur, "to" utilisera les valeurs actuelles. "to" plantera
    si l'un des paramètres de l'URL est null/undefined (ce qui vaut aussi dans le cas général).
*/

const tamRouter = router.sub(a => a("operation")("ofaId")("tam"));
tamRouter.to(a => a("COURANT")(4));
tamRouter.ttaCode = "THEORIQUE";
tamRouter.mprId = 5;

const echRouter: Router<typeof echeance> = router.sub(a => a("operation")("ofaId")("echeance"));
echRouter.to(a => a(3)("reglement")(4));
echRouter.echId = 8;
echRouter.reglement.regId = 1;

/*
    Comme vu dans l'exemple précédant, on peut facilement typer un routeur avec "Router<typeof config>",
    et donc ça marche aussi pour les sous routeurs.

    On peut donc imaginer que les différents composants de l'application prendront en props (ou en contexte)
    le sous-routeur qui leur correspond et il pourra même être définit à côté, pour être remonté au fur
    et à mesure, de la même façon que les composants.

    On peut du coup utiliser un composant qui route à plusieurs endroits dans l'application sans que le
    composant n'ait besoin de le savoir. Par exemple je pourrais donc avoir un composant "EcheanceList"
    qui prend en props un "Router<typeof echeance>" pour naviguer et utiliser son état dans son implémentation
    (pour afficher des pages de détail...), tout en étant capable de le réutiliser à plusieurs endroits.
    Dans mon exemple j'ai /operation/ofaId/echeance/...., mais je pourrais très bien avoir avec aussi
    /projet/echeance/... ou n'importe quoi d'autre.

    (Remarque de clôture : je l'ai pas dit avant mais évidemment les paramètres doivent tous avoir un
    nom unique, sinon le matching des paramètres via l'URL ne pourra pas marcher)
*/
