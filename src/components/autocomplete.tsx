import {autobind} from "core-decorators";
import {debounce} from "lodash-decorators";
import {observable, runInAction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {Autocomplete as RTAutocomplete, AutocompleteProps as RTAutocompleteProps, AutocompleteTheme} from "react-toolbox/lib/autocomplete";
import {InputTheme} from "react-toolbox/lib/input";
import {ProgressBar} from "react-toolbox/lib/progress_bar";

import * as styles from "./__style__/autocomplete.css";
export type AutocompleteStyle = Partial<typeof styles> & AutocompleteTheme & InputTheme;

/** Résultat du service de recherche. */
export interface AutocompleteResult {
    /** Données. */
    data: {
        key: string;
        label: string;
    }[];
    /** Nombre total de résultat. */
    totalCount: number;
}

/** Props du composant d'autocomplétion */
export interface AutocompleteProps extends RTAutocompleteProps {
    /** Service de résolution de code. */
    keyResolver: (key: number | string) => Promise<string | undefined>;
    /** Service de recherche. */
    querySearcher: (text: string) => Promise<AutocompleteResult | undefined>;
    /** CSS. */
    theme?: AutocompleteStyle;
}

/** Composant d'autocomplétion à partir d'une recherche serveur. */
@autobind
@observer
export class Autocomplete extends React.Component<AutocompleteProps, void> {

    /** Composant en chargement. */
    @observable private isLoading = false;
    /** Contenu du champ texte. */
    @observable private query = "";
    /** Liste des valeurs. */
    private readonly values = observable.map<string>();

    async componentWillMount() {
        const {value, keyResolver} = this.props;
        if (value) {
            this.query = await keyResolver(value) || value;
        }
    }

    /**
     * Est appelé à chaque saisie dans le champ texte.
     * @param query Le champ texte.
     */
    onQueryChange(query: string) {
        const formattedQuery = query && query.replace(/^\s*/, "");
        if (formattedQuery !== this.query) {
            this.search(formattedQuery);
        }
        this.query = formattedQuery;
    }

    /**
     * Effectue la recherche sur le serveur.
     * @param query Le champ texte.
     */
    @debounce(200)
    async search(query: string) {
        this.isLoading = true;
        const result = await this.props.querySearcher(query);
        runInAction(() => {
            this.values.replace(result && result.data.reduce((acc, next) => ({...acc, [next.key]: next.label}), {}) || {});
            this.isLoading = false;
        });
    }

    render() {
        return (
            <div data-focus="autocomplete">
                <RTAutocomplete
                    {...this.props}
                    multiple={false}
                    source={this.values.toJS()}
                    query={this.query || " "}
                    onQueryChange={this.onQueryChange}
                    maxLength={undefined}
                    suggestionMatch="disabled"
                />
                {this.isLoading ?
                    <ProgressBar type="linear" mode="indeterminate" theme={{linear: this.props.theme!.progressBar}} />
                : null}
            </div>
        );
    }
}

export default themr("autocomplete", styles)(Autocomplete);
