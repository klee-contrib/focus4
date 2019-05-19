import i18next from "i18next";
import {isEmpty} from "lodash";
import {debounce} from "lodash-decorators";
import {action, computed, observable, runInAction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";
import {
    Autocomplete as RTAutocomplete,
    AutocompleteProps as RTAutocompleteProps,
    AutocompleteTheme
} from "react-toolbox/lib/autocomplete";
import {InputTheme} from "react-toolbox/lib/input";
import {ProgressBar} from "react-toolbox/lib/progress_bar";

import {themr} from "@focus4/styling";

import autocompleteStyles from "./__style__/autocomplete.css";
export {autocompleteStyles};
export type AutocompleteStyle = Partial<typeof autocompleteStyles> & AutocompleteTheme & InputTheme;
const Theme = themr("autocomplete", autocompleteStyles);

/** Résultat du service de recherche. */
export interface AutocompleteResult {
    /** Données. */
    data?: {
        key: string;
        label: string;
    }[];
    /** Nombre total de résultat. */
    totalCount: number;
}

/** Props du composant d'autocomplétion */
export interface AutocompleteProps<T extends "string" | "number"> extends RTAutocompleteProps {
    /** Utilise l'autocomplete en mode "quick search" (pas de valeur, champ vidé à la sélection). */
    isQuickSearch?: boolean;
    /** Service de résolution de code. */
    keyResolver?: (key: any) => Promise<string | undefined>;
    /** Service de recherche. */
    querySearcher?: (text: string) => Promise<AutocompleteResult | undefined>;
    /** Au changement. */
    onChange: (value: (T extends "string" ? string : number) | undefined) => void;
    /** Type du champ ("string" ou "number"). */
    type: T;
    /** Valeur. */
    value: (T extends "string" ? string : number) | undefined;
    /** CSS. */
    theme?: AutocompleteStyle;
}

/** Surtouche de l'Autocomplete React-Toolbox pour utilisation des services de recherche serveur. */
@observer
export class Autocomplete<T extends "string" | "number"> extends React.Component<AutocompleteProps<T>> {
    protected inputElement!: HTMLInputElement | null;

    /** Requête d'autocomplete en cours. */
    @observable protected isLoading = false;

    /** Contenu du champ texte. */
    @observable protected query = "";

    /** Résultat de la recherche d'autocomplétion. */
    protected readonly data = observable.map<T extends "string" ? string : number>();

    /** Résultats sous format JSON, pour l'autocomplete. */
    @computed.struct
    get source() {
        return this.data.toJSON();
    }

    /** Cette valeur est gardée à chaque retour de l'autocomplete pour savoir s'il faut ou non vider la valeur lorsqu'on saisit du texte. */
    protected value?: string;

    /** Reference du composant Autocomplete de RT, qui n'a pas renseigné ses types -_-' */
    private autocomplete?: any;

    async componentWillMount() {
        const {value, keyResolver, isQuickSearch} = this.props;
        if ((value || value === 0) && !isQuickSearch && keyResolver) {
            const label = i18next.t((await keyResolver(value)) || "");
            runInAction(() => {
                this.query = label || `${value}`;
                if (label) {
                    this.data.set(value, label);
                }
            });
        }
    }

    componentDidMount() {
        this.inputElement = (findDOMNode(this) as Element).querySelector("input");
    }

    focus() {
        // C'est moche mais sinon ça marche pas...
        setTimeout(() => this.inputElement && this.inputElement.focus(), 0);
    }

    /**
     * Est appelé à chaque saisie dans le champ texte.
     * @param query Le champ texte.
     */
    @action.bound
    onQueryChange(query: string) {
        const {onQueryChange, onChange, isQuickSearch, type} = this.props;

        // On compare la query à la dernière valeur retournée par l'autocomplete : si elles sont différentes, alors on vide le champ.
        const label =
            this.value &&
            this.data.get((type === "number" ? +this.value : this.value) as T extends "string" ? string : number);
        if (label !== query && onChange) {
            onChange(undefined);
        }

        if (query !== this.query && (!this.value || !isQuickSearch)) {
            this.query = query;
            if (onQueryChange) {
                onQueryChange(query);
            }
            this.debouncedSearch(query);
        }

        if (isQuickSearch) {
            this.value = "";
        }

        if (!this.query) {
            this.data.clear();
        }
    }

    /**
     * Est appelé lorsque l'on sélectionne une valeur.
     * @param value La valeur sélectionnée.
     */
    @action.bound
    onValueChange(value: string) {
        const {isQuickSearch, onChange, type} = this.props;

        if (isQuickSearch && value) {
            this.query = "";
            this.data.clear();
            this.focus();
        }

        this.value = value;

        if (onChange) {
            const v = (type === "number" ? +value : value) as T extends "string" ? string : number;
            onChange(v || v === 0 ? v : undefined);
        }
    }

    /**
     * Effectue la recherche sur le serveur.
     * @param query Le champ texte.
     */
    @action.bound
    async search(query: string) {
        if (this.props.querySearcher && query && query.trim().length) {
            this.isLoading = true;
            const result = await this.props.querySearcher(encodeURIComponent(query.trim()));
            runInAction("replaceResults", () => {
                this.data.replace(
                    (result &&
                        result.data &&
                        result.data.reduce((acc, next) => ({...acc, [next.key]: i18next.t(next.label)}), {})) ||
                        {}
                );
                this.isLoading = false;
            });
        }
    }

    @debounce(200)
    private debouncedSearch(query: string) {
        this.search(query);
    }

    /**
     * Pour sélectionner le premier élément de la liste de suggestion avec Tab.
     * Recopie une bonne partie du mécanisme de l'autocomplete de RT puisqu'on ne peut pas faire autrement...
     */
    @action.bound
    onKeyDown(event: KeyboardEvent) {
        if (event.key === "Tab" && this.autocomplete) {
            const {active} = this.autocomplete.state;

            let targetValue = active;
            if (!active && this.source && !isEmpty(this.source)) {
                targetValue = Object.keys(this.source)[0];
            }

            const values = this.autocomplete.values(this.autocomplete.props.value);
            const source = this.autocomplete.source();
            const newValue = targetValue === void 0 ? (event!.target! as any).id : targetValue;

            if (this.autocomplete.isValueAnObject()) {
                const newItem = Array.from(source).reduce<{[key: string]: any}>((obj: any, [k, value]: any) => {
                    if (k === newValue) {
                        (obj as any)[k] = value;
                    }
                    return obj;
                }, {}) as any;

                if (Object.keys(newItem).length === 0 && newValue) {
                    newItem[newValue] = newValue;
                }

                return this.autocomplete.handleChange({...this.autocomplete.mapToObject(values), ...newItem}, event);
            }

            this.autocomplete.handleChange([newValue, ...values.keys()], event);
        }

        if (this.props.onKeyDown) {
            this.props.onKeyDown();
        }
    }

    render() {
        const {keyResolver, querySearcher, theme: pTheme, isQuickSearch, ...props} = this.props;
        return (
            <Theme theme={pTheme}>
                {theme => (
                    <div data-focus="autocomplete">
                        <RTAutocomplete
                            {...props}
                            onChange={this.onValueChange}
                            multiple={false}
                            source={this.source}
                            query={this.query}
                            onQueryChange={this.onQueryChange}
                            maxLength={undefined}
                            suggestionMatch="disabled"
                            type="text"
                            theme={theme}
                            innerRef={(ref: any) => (this.autocomplete = ref)}
                            onKeyDown={this.onKeyDown}
                        />
                        {this.isLoading ? (
                            <ProgressBar type="linear" mode="indeterminate" theme={{linear: theme.progressBar}} />
                        ) : null}
                    </div>
                )}
            </Theme>
        );
    }
}
