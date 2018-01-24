import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import * as styles from "./__style__/display.css";
export type DisplayStyle = Partial<typeof styles>;

/** Props du composant d'affichage. */
export interface DisplayProps {
    /** Formatteur. */
    formatter?: (value: any) => string;
    /** Service de résolution de code. */
    keyResolver?: (key: number | string) => Promise<string | undefined>;
    /** Nom de la propriété de libellé, pour liste de référence. */
    labelKey?: string;
    /** CSS. */
    theme?: DisplayStyle;
    /** Valeur à afficher. */
    value?: string | number;
    /** Nom de la propriété de libellé, pour liste de référence. */
    valueKey?: string;
    /** Liste des valeurs de référence. */
    values?: {}[];
}

/** Composant d'affichage par défaut, gère la résolution de la valeur par liste de référence ou par service. */
@observer
export class Display extends React.Component<DisplayProps, void> {

    @observable value?: any;

    componentWillMount() {
        this.load(this.props);
    }

    componentWillReceiveProps(props: DisplayProps) {
        if (props.value !== this.props.value) {
            this.load(props);
        }
    }

    async load({value, keyResolver}: DisplayProps) {
        if (value && keyResolver) {
            this.value = await keyResolver(value) || value;
        } else {
            this.value = value;
        }
    }

    render() {
        const {valueKey = "code", labelKey = "label", values, value, formatter, theme} = this.props;
        // tslint:disable-next-line:triple-equals ---> Le "==" est volontaire pour convertir un éventuel ID de type string (comme celui donné par un Select) en number.
        const ref = values && values.find(v => (v as any)[valueKey] == value);
        const displayed = ref && (ref as any)[labelKey] || this.value;
        return (
            <div data-focus="display" className={theme!.display}>
                {formatter && formatter(displayed) || displayed}
            </div>
        );
    }
}

export default themr("display", styles)(Display);
