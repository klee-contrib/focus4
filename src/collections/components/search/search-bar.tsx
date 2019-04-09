import i18next from "i18next";
import {difference, toPairs} from "lodash";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {Button, IconButton} from "react-toolbox/lib/button";
import {Dropdown} from "react-toolbox/lib/dropdown";
import {FontIcon} from "react-toolbox/lib/font_icon";

import {getIcon} from "../../../components";
import {Entity, fieldFor, FormEntityField, makeField, toFlatValues} from "../../../entity";
import {themr} from "../../../theme";

import {SearchStore} from "../../store";

import * as styles from "./__style__/search-bar.css";
export type SearchBarStyle = Partial<typeof styles>;
const Theme = themr("searchBar", styles);

/** Props de la SearchBar. */
export interface SearchBarProps<T, C extends Entity> {
    /** Rendu du composant du critère. */
    criteriaComponent?: React.ReactElement;
    /** Désactive la gestion des critères dans le champ texte. */
    disableInputCriteria?: boolean;
    /** Préfixe i18n pour les libellés et les icônes. Par défaut : "focus" */
    i18nPrefix?: string;
    /** Placeholder pour le champ texte. */
    placeholder?: string;
    /** Nom de la propriété des critères correspondant au scope, pour affichage du sélecteur. */
    scopeKey?: keyof C;
    /** Valeurs possible sdu scope. */
    scopes?: {code: string; label: string}[];
    /** Store associé. */
    store: SearchStore<T, C>;
    /** CSS. */
    theme?: SearchBarStyle;
}

/** Barre de recherche permettant de contrôle le texte et les critères personnalisés de recherche. */
@observer
export class SearchBar<T, C extends Entity> extends React.Component<SearchBarProps<T, C>> {
    /** L'input HTML. */
    protected input?: HTMLInputElement | null;

    /** La liste des critères saisis dans le champ texte. */
    @observable protected criteriaList: string[] = [];
    /** Affiche le composant de critère. */
    @observable protected showCriteriaComponent = false;

    /** Paires clés/valeurs des différents critères. */
    @computed
    protected get flatCriteria() {
        const {criteria} = this.props.store;
        if (criteria) {
            return toPairs(toFlatValues(criteria));
        } else {
            return [];
        }
    }

    /** Listes des noms de critères dans l'ordre de saisie dans le champ texte. */
    @computed
    protected get criteria() {
        return this.criteriaList.filter(crit => this.flatCriteria.map(([c, _]) => c).find(c => c === crit));
    }

    /** Texte de la SearchBar. */
    @computed
    get text() {
        const {disableInputCriteria, store} = this.props;
        if (disableInputCriteria) {
            return store.query; // évidemment, si on affiche pas les critères, c'est facile.
        } else {
            // Toute la difficulté réside dans le fait qu'on a besoin de conserver l'ordre dans lequel l'utilisateur à voulu saisir les critères.
            // Et également de ne pas changer le rendu entre ce que l'utilisateur à tapé et ce qu'il voit.
            const criteria = this.criteria
                .concat(difference(this.flatCriteria.map(c => c[0]), this.criteria))
                .map(c => [c, this.flatCriteria.find(i => i[0] === c) && this.flatCriteria.find(i => i[0] === c)![1]])
                .filter(([_, value]) => value)
                .map(([key, value]) => `${key}:${value}`);
            return `${criteria.join(" ")}${criteria.length && (store.query && store.query.trim()) ? " " : ""}${
                store.query
            }`;
        }
    }

    /** Récupère la liste des erreurs de critère à afficher sous la barre de recherche. */
    @computed
    get error() {
        const {i18nPrefix = "focus", store} = this.props;
        const error = toPairs(store.criteriaErrors)
            .filter(([_, isError]) => isError)
            .map(([crit]) => crit)
            .join(", ");
        if (error) {
            return `${i18next.t(`${i18nPrefix}.search.bar.error`)} : ${error}`;
        } else {
            return undefined;
        }
    }

    componentDidMount() {
        this.focusQuery();
    }

    /** Met le focus sur la barre de recherche. */
    focusQuery() {
        if (this.input) {
            this.input.focus();
            this.input.setSelectionRange(this.text.length, this.text.length);
        }
    }

    /** Le onChange de l'input */
    @action.bound
    protected onInputChange({currentTarget}: {currentTarget: HTMLInputElement}) {
        const {disableInputCriteria, store} = this.props;
        if (disableInputCriteria || !store.criteria) {
            store.query = currentTarget.value; // Encore une fois, si pas de critères, c'est facile.
        } else if (store.criteria) {
            // On tokenise ce qu'à écrit l'utilisateur en divisant à tous les espaces.
            const tokens = currentTarget.value.trim().split(" ");
            let token = tokens[0];
            let skip = 0;
            this.criteriaList = [];

            // On parcourt les tokens et on cherche pour un token de la forme critere:valeur.
            while (1) {
                const [crit = "", value = ""] = (token && token.split(/:(.+)/)) || [];
                // Si le token est de la bonne forme et que le critère existe, alors on l'enregistre.
                if (crit && value && (store.criteria as any)[crit] && !this.criteriaList.find(u => u === crit)) {
                    ((store.criteria as any)[crit] as FormEntityField).value = value;
                    skip++;
                    this.criteriaList.push(crit);
                    token = tokens[skip];
                } else {
                    break; // On s'arrête dès qu'un token ne matche plus (ce qui empêche de mettre du texte entre des critères.)
                }
            }

            // On force tous les critères sont trouvés à undefined.
            difference(Object.keys(toFlatValues(store.criteria)), this.criteriaList).forEach(
                crit => (((store.criteria as any)[crit] as FormEntityField).value = undefined)
            );

            // Et on reconstruit le reste de la query avec ce qu'il reste.
            store.query = `${tokens.slice(skip).join(" ")}${currentTarget.value.match(/\s*$/)![0]}`; // La regex sert à garder les espaces en plus à la fin.
        }
    }

    /** Au clic sur un scope. */
    @action.bound
    protected onScopeSelection(scope: string) {
        const {scopeKey, store} = this.props;
        if (store.criteria && scopeKey) {
            this.focusQuery();
            store.setProperties({
                groupingKey: undefined,
                selectedFacets: {},
                sortAsc: true,
                sortBy: undefined
            });
            ((store.criteria as any)[scopeKey] as FormEntityField).value = scope;
        }
    }

    /** Vide la barre. */
    @action.bound
    protected clear() {
        const {disableInputCriteria, store} = this.props;
        store.query = "";
        if (store.criteria && !disableInputCriteria) {
            // On vide les critères que s'ils sont affichés.
            store.criteria.clear();
        }
    }

    /** Affiche ou masque le composant de critères. */
    @action.bound
    protected toggleCriteria() {
        this.showCriteriaComponent = !this.showCriteriaComponent;
        this.props.store.blockSearch = !this.props.store.blockSearch;
    }

    render() {
        const {i18nPrefix = "focus", placeholder, store, scopeKey, scopes, criteriaComponent} = this.props;
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <div style={{position: "relative"}}>
                        {this.showCriteriaComponent ? (
                            <div className={theme.criteriaWrapper} onClick={this.toggleCriteria} />
                        ) : null}
                        <div className={`${theme.bar} ${this.error ? theme.error : ""}`}>
                            {scopes && store.criteria && scopeKey ? (
                                <Dropdown
                                    onChange={this.onScopeSelection}
                                    value={
                                        ((store.criteria as any)[scopeKey] as FormEntityField).value as string | number
                                    }
                                    source={[
                                        {value: undefined, label: ""},
                                        ...scopes.map(({code, label}) => ({value: code, label}))
                                    ]}
                                    theme={{dropdown: theme.dropdown, values: theme.scopes}}
                                />
                            ) : null}
                            <div className={theme.input}>
                                <FontIcon className={theme.searchIcon}>
                                    {getIcon(`${i18nPrefix}.icons.searchBar.search`)}
                                </FontIcon>
                                <input
                                    name="search-bar-input"
                                    onChange={this.onInputChange}
                                    placeholder={i18next.t(placeholder || "")}
                                    ref={input => (this.input = input)}
                                    value={this.text}
                                />
                            </div>
                            {this.text && !this.showCriteriaComponent ? (
                                <IconButton
                                    icon={getIcon(`${i18nPrefix}.icons.searchBar.clear`)}
                                    onClick={this.clear}
                                />
                            ) : null}
                            {store.criteria && criteriaComponent && !this.showCriteriaComponent ? (
                                <IconButton
                                    icon={getIcon(`${i18nPrefix}.icons.searchBar.open`)}
                                    onClick={this.toggleCriteria}
                                />
                            ) : null}
                        </div>
                        {!this.showCriteriaComponent && this.error ? (
                            <span className={theme.errors}>{this.error}</span>
                        ) : null}
                        {this.showCriteriaComponent ? (
                            <div className={theme.criteria}>
                                <IconButton
                                    icon={getIcon(`${i18nPrefix}.icons.searchBar.close`)}
                                    onClick={this.toggleCriteria}
                                />
                                {fieldFor(
                                    makeField(
                                        () => store.query,
                                        {label: `${i18nPrefix}.search.bar.query`},
                                        query => (store.query = query || ""),
                                        true
                                    )
                                )}
                                {criteriaComponent}
                                <div className={theme.buttons}>
                                    <Button
                                        primary
                                        raised
                                        onClick={this.toggleCriteria}
                                        label={i18next.t(`${i18nPrefix}.search.bar.search`)}
                                    />
                                    <Button onClick={this.clear} label={i18next.t(`${i18nPrefix}.search.bar.reset`)} />
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </Theme>
        );
    }
}
