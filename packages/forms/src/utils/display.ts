import {autorun} from "mobx";
import {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {output, ZodType} from "zod";

import {SingleZodType} from "@focus4/entities";
import {getDefaultFormatter, ReferenceList} from "@focus4/stores";

/** Props pour `useDisplay`. */
export interface UseDisplayProps<S extends ZodType> {
    /** Formatteur. */
    formatter?: ((value: output<SingleZodType<S>> | undefined) => string) | string;
    /** Service de résolution de code. */
    keyResolver?: (key: output<SingleZodType<S>>) => Promise<string | undefined>;
    /** Schéma du champ (celui du domaine). */
    schema: S;
    /** Valeur à afficher. */
    value?: output<S>;
    /** Liste des valeurs de référence. */
    values?: ReferenceList;
}

/**
 * Calcule la valeur à afficher pour un champ, à partir du formatteur, d'une liste de référence et/ou d'un keyResolver.
 *
 * Utilisé par `Display`.
 */
export function useDisplay<S extends ZodType>({
    schema,
    formatter = getDefaultFormatter(schema),
    keyResolver,
    value,
    values
}: UseDisplayProps<S>) {
    const {t} = useTranslation();

    const format = useCallback(
        function format(v?: output<SingleZodType<S>>) {
            return t(typeof formatter === "string" ? formatter : formatter(v), {value: v});
        },
        [formatter, t]
    );

    const [label, setLabel] = useState<string[] | string>();
    useEffect(
        () =>
            autorun(() => {
                if (keyResolver) {
                    if (Array.isArray(value)) {
                        Promise.all(
                            value.map((v: output<SingleZodType<S>>) => keyResolver(v).then(res => res ?? `${v}`))
                        ).then(setLabel);
                    } else if (value) {
                        keyResolver(value as output<SingleZodType<S>>).then(res => setLabel(res ?? `${value}`));
                    } else {
                        setLabel(undefined);
                    }
                } else if (Array.isArray(value)) {
                    if (values) {
                        setLabel(
                            values
                                ?.filter(v => value.find((v2: output<SingleZodType<S>>) => v[values.$valueKey] === v2))
                                .map(v => format(v[values.$labelKey] ?? `${v[values.$valueKey]}`))
                        );
                    } else {
                        setLabel(value.map((v: output<SingleZodType<S>>) => format(v)));
                    }
                } else {
                    setLabel(format(values?.getLabel(value) ?? value));
                }
            }),
        [format, keyResolver, value, values]
    );

    return label;
}
