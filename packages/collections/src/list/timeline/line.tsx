import {ComponentType} from "react";
import {ZodType} from "zod";

import {Domain, EntityField, FieldEntry, stringFor} from "@focus4/stores";
import {ToBem} from "@focus4/styling";

import {TimelineCss} from "../__style__/timeline.css";

/** Composant de ligne pour timeline. */
export function TimelineLine<T>({
    data,
    dateSelector,
    domRef,
    LineComponent,
    theme
}: {
    /** Données. */
    data: T;
    /** Le sélecteur pour le champ date, pour une ligne timeline. */
    dateSelector: (data: T) => EntityField<FieldEntry<Domain<ZodType<string>>>>;
    /** Ref vers l'élement DOM racine de la ligne. */
    domRef?: (element: HTMLElement | null) => void;
    /** Composant de ligne. */
    LineComponent: ComponentType<{data: T}>;
    /** CSS. */
    theme: ToBem<TimelineCss>;
}) {
    return (
        <li ref={domRef}>
            <div className={theme.date()}>{stringFor(dateSelector(data))}</div>
            <div className={theme.badge()} />
            <div className={theme.panel()}>
                <LineComponent data={data} />
            </div>
        </li>
    );
}
