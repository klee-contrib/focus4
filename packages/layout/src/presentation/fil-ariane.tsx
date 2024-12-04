/* eslint-disable no-unmodified-loop-condition */
/* eslint-disable @typescript-eslint/no-loop-func */
import i18next from "i18next";
import {useObserver} from "mobx-react";
import {Fragment} from "react/jsx-runtime";

import {Router, UrlRouteDescriptor} from "@focus4/core";
import {CSSProp, useTheme} from "@focus4/styling";
import {FontIcon} from "@focus4/toolbox";

import filArianeCss, {FilArianeCss} from "./__style__/fil-ariane.css";
export {filArianeCss};
export type {FilArianeCss};

/**
 * Props pour le fil d'Ariane.
 */
export interface FilArianeProps {
    /** Préfixe i18n pour l'icône du séparateur. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Si renseigné, n'affiche pas de nouvel élément dans le fil d'ariane au delà de la profondeur demandée. */
    maxDepth?: number;
    /** Permet de résoudre une valeur personnalisée pour la variable {{param}} dans les traductions en fonction du paramètre et de sa valeur. */
    paramResolver?: (paramName: string, paramValue: string | number) => string | undefined;
    /** Nom de la clé i18n pour l'élement racine de chaque route. Par défaut : "root". */
    rootName?: string;
    /** Routeur sur lequel construire le fil d'ariane. */
    router: Router;
    /** Préfixe i18n pour les clés de traductions calculées par route. Par défaut : "router". */
    routerI18nPrefix?: string;
    /** CSS. */
    theme?: CSSProp<FilArianeCss>;
}

/**
 * Le composant `FilAriane` permet de poser un "fil d'Ariane", construit automatiquement à partir d'un routeur.
 *
 * Il se basera sur la route active dans le routeur pour proposer un lien vers chacune des sections d'URL qui la contienne.
 * Le libellé de chaque lien doit être décrit dans les fichiers de traductions i18n du projet.
 *
 * Par exemple, pour la route `/utilisateurs/:utiId`, l'objet i18n doit être décrit de la forme :
 * ```
 * const router = {
 *     root: "Accueil",
 *     utilisateurs: {
 *         root: "Utilisateurs",
 *         utiId: {
 *             root: "Détail de l'utilisateur : {{param}}"
 *         }
 *     }
 * }
 * ```
 *
 * _Remarque : (Les noms `router` et `root` sont paramétrables)._
 *
 * Pour les libellés correspondant à des paramètres (comme `utiId` dans l'exemple précédent), vous pouvez utiliser la variable `{{param}}`
 * qui référence soit la valeur du paramètre, soit une valeur calculée par une fonction dédiée `paramResolver` à partir de son nom et de sa valeur.
 *
 * Si vous voulez qu'une section ne soit pas affichée dans le fil d'ariane, il suffit que son libellé soit vide.
 */
export function FilAriane({
    i18nPrefix = "focus",
    maxDepth,
    paramResolver = (_, x) => `${x}`,
    rootName = "root",
    router,
    routerI18nPrefix = "router",
    theme: pTheme
}: FilArianeProps) {
    const theme = useTheme("filAriane", filArianeCss, pTheme);
    return useObserver(() => {
        let currentRouter = router;
        let currentRoute = currentRouter.get(x => x);
        const routesList = [];
        let key = currentRoute!;

        while (currentRoute !== undefined && (maxDepth === undefined || routesList.length < maxDepth)) {
            const currentState = currentRouter.state[currentRoute];
            if (
                typeof currentState === "object" ||
                typeof currentState === "number" ||
                typeof currentState === "string"
            ) {
                routesList.push({
                    route: currentRoute,
                    dictionaryKey: i18next.t(`${routerI18nPrefix}.${key}.${rootName}`, {
                        param:
                            typeof currentState !== "object"
                                ? paramResolver(currentRoute, currentState) ?? currentState
                                : undefined
                    }),
                    url: currentRouter.href(x => x(typeof currentState === "object" ? currentRoute! : currentState))
                });

                currentRouter = currentRouter.sub(x => x(currentRoute!) as UrlRouteDescriptor<any>);
                currentRoute = currentRouter.get(x => x);

                key += `.${currentRoute}`;
            } else {
                break;
            }
        }

        if (!routesList.length && (maxDepth ?? Infinity) > 0) {
            routesList.push({route: "/", dictionaryKey: i18next.t(`${routerI18nPrefix}.${rootName}`), url: "#/"});
        }

        const finalRoutes = routesList.filter(x => x.dictionaryKey);
        return (
            <span className={theme.container()}>
                {finalRoutes.map((x, i) => (
                    <Fragment key={x.route}>
                        {i !== finalRoutes.length - 1 ? (
                            <a className={theme.item()} href={x.url}>
                                {x.dictionaryKey}
                            </a>
                        ) : (
                            <span className={theme.item({active: true})}>{x.dictionaryKey}</span>
                        )}
                        {i !== finalRoutes.length - 1 ? (
                            <FontIcon
                                className={theme.separator()}
                                icon={{i18nKey: `${i18nPrefix}.icons.filAriane.separator`}}
                            />
                        ) : null}
                    </Fragment>
                ))}
            </span>
        );
    });
}
