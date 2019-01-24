import i18next from "i18next";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themeable} from "react-css-themr";
import {Chip, ChipTheme} from "react-toolbox/lib/chip";

/** Type de Chip pour la recherche. */
export type ChipType = "filter" | "facet" | "sort" | "group";

/** Props du SearchChip. */
export interface SearchChipProps {
    /** Code du champ affiché. */
    code: string;
    /** Libellé associé au code. */
    codeLabel: string;
    /** Affiche la croix pour la suppression. */
    deletable?: boolean;
    /** Affiche le résultat (si non vide) de cette fonction à la place de la valeur ou de son libellé existant. */
    keyResolver?: (type: ChipType, code: string, value: string) => Promise<string | undefined>;
    /** Appelé au clic sur la suppression. */
    onDeleteClick?: () => void;
    /** Affiche le code en plus de la valeur. */
    showCode?: boolean;
    /** CSS du Chip. */
    theme?: ChipTheme;
    /** Passe le style retourné par cette fonction au Chip. */
    themer?: (type: ChipType, code: string, value?: string) => ChipTheme | undefined;
    /** Type de champ. */
    type: ChipType;
    /** Valeur du champ affiché. */
    value?: string;
    /** Libellé associé à la valeur. */
    valueLabel?: string;
}

/** Chip avec un keyResolver. */
@observer
export class SearchChip extends React.Component<SearchChipProps> {
    @observable valueLabel = this.props.valueLabel;

    async componentDidMount() {
        const {code, keyResolver, type, value} = this.props;
        if (keyResolver && value) {
            const valueLabel = await keyResolver(type, code, value);
            if (valueLabel) {
                this.valueLabel = valueLabel;
            }
        }
    }

    render() {
        const {code, codeLabel, deletable, onDeleteClick, showCode, theme = {}, themer, type, value} = this.props;
        return (
            <Chip
                deletable={deletable}
                onDeleteClick={onDeleteClick}
                theme={themeable(theme as any, (themer && themer(type, code, value)) || ({} as any))}
            >
                {!value
                    ? i18next.t(codeLabel)
                    : showCode
                    ? `${i18next.t(codeLabel)} : ${i18next.t(this.valueLabel || value)}`
                    : i18next.t(this.valueLabel || value)}
            </Chip>
        );
    }
}
