import i18next from "i18next";

import {FieldEntry} from "@focus4/entities";

import {ReferenceList} from "../reference";

import {EntityField} from "./types";

/**
 * Formatte un champ et récupère la représentation textuelle associée.
 *
 * Utilise le `displayFormatter` du domaine et peut résoudre une liste de référence (si renseignée).
 *
 * @param field La définition de champ.
 * @param values L'éventulle liste de référence associée.
 */
export function stringFor<F extends FieldEntry>(field: EntityField<F>, values: ReferenceList = [] as any) {
    const {
        value,
        $field: {
            domain: {displayFormatter = (t: string) => i18next.t(t)}
        }
    } = field;
    const found = values.find(val => val[values.$valueKey] === value);
    const processedValue = found?.[values.$labelKey] ?? value;
    return typeof displayFormatter === "string"
        ? i18next.t(displayFormatter, {value: processedValue})
        : displayFormatter(processedValue);
}
