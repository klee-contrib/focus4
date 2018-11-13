import i18next from "i18next";
import {debounce} from "lodash-decorators";
import {action, observable, ObservableMap, runInAction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";
export {ObservableMap};

import {
    Autocomplete as RTAutocomplete,
    AutocompleteProps as RTAutocompleteProps,
    AutocompleteTheme
} from "react-toolbox/lib/autocomplete";
import {InputTheme} from "react-toolbox/lib/input";
import {ProgressBar} from "react-toolbox/lib/progress_bar";

import {themr} from "../theme";

import * as styles from "./__style__/autocomplete.css";
import { isEmpty } from 'lodash';
export type AutocompleteStyle = Partial<typeof styles> & AutocompleteTheme & InputTheme;
const Theme = themr("autocomplete", styles);

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
export interface AutocompleteProps extends RTAutocompleteProps {
    /** Utilise l'autocomplete en mode "quick search" (pas de valeur, champ vidé à la sélection). */
    isQuickSearch?: boolean;
    /** Service de résolution de code. */
    keyResolver?: (key: any) => Promise<string | undefined>;
    /** Service de recherche. */
    querySearcher?: (text: string) => Promise<AutocompleteResult | undefined>;
    /** Au changement. */
    onChange?: (value: any) => void;
    /** Valeur. */
    value?: any;
    /** CSS. */
    theme?: AutocompleteStyle;
}

/** Surtouche de l'Autocomplete React-Toolbox pour utilisation des services de recherche serveur. */
@observer
export class Autocomplete extends React.Component<AutocompleteProps> {
    protected inputElement!: HTMLInputElement | null;

    /** Composant en chargement. */
    @observable protected isLoading = false;
    /** Contenu du champ texte. */
    @observable protected query = "";
    /** Liste des valeurs. */
    protected readonly values = observable.map<string>();

    /** Cette valeur est gardée à chaque retour de l'autocomplete pour savoir s'il faut ou non vider la valeur lorsqu'on saisit du texte. */
    protected value?: string;

    /** Reference du composant Autocomplete de RT, qui n'a pas renseigné ses types -_-' */
    private RtAcRef?: any | null;

    async componentWillMount() {
        const {value, keyResolver, isQuickSearch} = this.props;
        if (value && !isQuickSearch && keyResolver) {
            this.query = i18next.t((await keyResolver(value)) || "") || value;
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
        const {onQueryChange, onChange, isQuickSearch} = this.props;

        // On compare la query à la dernière valeur retournée par l'autocomplete : si elles sont différentes, alors on vide le champ.
        const label = this.value && this.values.get(this.value);
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
    }

    /**
     * Est appelé lorsque l'on sélectionne une valeur.
     * @param value La valeur sélectionnée.
     */
    @action.bound
    onValueChange(value: string) {
        const {isQuickSearch, onChange} = this.props;

        if (isQuickSearch && value) {
            this.query = "";
            this.values.clear();
            this.focus();
        }

        this.value = value;

        if (onChange) {
            onChange(value);
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
                this.values.replace(
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

    onKeyDown(event: KeyboardEvent) {

        /// Gestion du tab avec selection
        if (event.key === "Tab" && this.RtAcRef) {
            this.selectOrCreateActiveItem(event);
        }
    }

    selectOrCreateActiveItem(event: KeyboardEvent) {
        const active = this.RtAcRef.state.active;
        let target = active;
        if (!active && this.RtAcRef.props.source && !isEmpty(this.RtAcRef.props.source)) {
            target = Object.keys(this.RtAcRef.props.source)[0];
        }

        this.select(event, target);
    }

    select(event: KeyboardEvent, target: any) {
        const values = this.RtAcRef.values(this.RtAcRef.props.value);
        const source = this.RtAcRef.source();
        const newValue = target === void 0 ? (event!.target! as any).id : target;

        if (this.RtAcRef.isValueAnObject()) {
            const newItem = Array.from(source).reduce((obj: any, [k, value]: any) => {
                if (k === newValue) {
                    (obj as any)[k] = value;
                }
                return obj;
            }, {});

            if (Object.keys(newItem).length === 0 && newValue) {
                newItem[newValue] = newValue;
            }

            return this.RtAcRef.handleChange(Object.assign(this.RtAcRef.mapToObject(values), newItem), event);
        }

        this.RtAcRef.handleChange([newValue, ...values.keys()], event);
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
                            source={this.values.toJSON()}
                            query={this.query}
                            onQueryChange={this.onQueryChange}
                            maxLength={undefined}
                            suggestionMatch="disabled"
                            theme={theme}
                            innerRef={(ref: any) => (this.RtAcRef = ref)}
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
