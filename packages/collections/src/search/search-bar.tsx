import {difference} from "es-toolkit";
import {useLocalObservable, useObserver} from "mobx-react";
import {AnimatePresence, motion} from "motion/react";
import {ReactElement, useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";

import {SelectCheckbox} from "@focus4/form-toolbox";
import {fieldFor} from "@focus4/forms";
import {CollectionStore, FormEntityField, makeField, makeReferenceList, toFlatValues} from "@focus4/stores";
import {CSSProp, getSpringTransition, uiConfig, useTheme} from "@focus4/styling";
import {Button, Checkbox, FontIcon, IconButton} from "@focus4/toolbox";

import searchBarCss, {SearchBarCss} from "./__style__/search-bar.css";
export {searchBarCss};
export type {SearchBarCss};

/** Props de la SearchBar. */
export interface SearchBarProps<T extends object, C> {
    /** Rendu du composant du critère. */
    criteriaComponent?: ReactElement;
    /** Active la gestion des critères dans le champ texte. */
    enableInputCriteria?: boolean;
    /** Préfixe i18n pour les libellés et les icônes. Par défaut : "focus" */
    i18nPrefix?: string;
    /** Placeholder pour le champ texte. */
    placeholder?: string;
    /** Libellés des noms de champs de recherche. */
    searchFieldNames?: Record<string, string>;
    /** Store associé. */
    store: CollectionStore<T, C>;
    /** CSS. */
    theme?: CSSProp<SearchBarCss>;
}

/**
 * La `SearchBar` est un composant indépendant de l'[`AdvancedSearch`](/docs/listes-composants-de-recherche-advancedsearch--docs) que l'on peut donc poser séparament (par exemple dans le `Header`) pour gérer la partie textuelle de la recherche.
 *
 * Le composant agit naturellement sur le champ `query`, mais également sur les critères personnalisés `criteria`, qu'il va par défaut ajouter dans le champ texte pour une saisie manuelle (du genre `criteriaName:criteriaValue` ; ce comportement est désactivable via la prop `disableInputCriteria`).
 * Il est possible également de lui passer un composant personnalisé de saisie des critères qu'il va pouvoir afficher à la demande pour saisir de manière plus précise les différents critères.
 */
export function SearchBar<T extends object, C>({
    criteriaComponent,
    enableInputCriteria,
    i18nPrefix = "focus",
    placeholder,
    searchFieldNames = {},
    store,
    theme: pTheme
}: SearchBarProps<T, C>) {
    const {t} = useTranslation();

    /** L'input HTML. */
    const input = useRef<HTMLInputElement>(null);

    /** Affiche le panneau pour les critères et la sélection des champs textes. */
    const [showPanel, setShowPanel] = useState(false);

    const state = useLocalObservable(() => ({
        /** La liste des critères saisis dans le champ texte. */
        criteriaList: [] as string[],

        /** Paires clés/valeurs des différents critères. */
        get flatCriteria() {
            const {criteria} = store;
            if (criteria) {
                return Object.entries(toFlatValues(criteria));
            } else {
                return [];
            }
        },

        /** Listes des noms de critères dans l'ordre de saisie dans le champ texte. */
        get criteria() {
            return this.criteriaList.filter(crit => this.flatCriteria.map(([c, _]) => c).find(c => c === crit));
        },

        /** Texte de la SearchBar. */
        get text() {
            if (!enableInputCriteria) {
                return store.query; // Évidemment, si on affiche pas les critères, c'est facile.
            } else {
                /*
                 * Toute la difficulté réside dans le fait qu'on a besoin de conserver l'ordre dans lequel l'utilisateur à voulu saisir les critères.
                 * Et également de ne pas changer le rendu entre ce que l'utilisateur à tapé et ce qu'il voit.
                 */
                const criteria = this.criteria
                    .concat(
                        difference(
                            this.flatCriteria.map(c => c[0]),
                            this.criteria
                        )
                    )
                    .map(c => [
                        c,
                        this.flatCriteria.find(i => i[0] === c) && this.flatCriteria.find(i => i[0] === c)![1]
                    ])
                    .filter(([_, value]) => value)
                    .map(([key, value]) => `${key as string}:${value as string}`);
                return `${criteria.join(" ")}${criteria.length && store.query?.trim() ? " " : ""}${store.query}`;
            }
        },

        /** Récupère la liste des erreurs de critère à afficher sous la barre de recherche. */
        get error() {
            const error = Object.entries(store.criteriaErrors)
                .filter(([_, isError]) => isError)
                .map(([crit]) => crit)
                .join(", ");
            if (error) {
                return `${t(`${i18nPrefix}.search.bar.error`)} : ${error}`;
            } else {
                return undefined;
            }
        },

        get placeholder() {
            const searchFields = store.searchFields ?? store.availableSearchFields;
            return (
                placeholder ??
                (searchFields.length
                    ? `${t(`${i18nPrefix}.search.bar.searchBy`)} ${searchFields
                          .map(x => (searchFieldNames[x] ?? x).toLowerCase())
                          .join(", ")}`
                    : "")
            );
        },

        /** Le onChange de l'input */
        onInputChange({currentTarget}: {currentTarget: HTMLInputElement}) {
            if (!enableInputCriteria || !store.criteria) {
                store.query = currentTarget.value; // Encore une fois, si pas de critères, c'est facile.
            } else if (store.criteria) {
                // On tokenise ce qu'à écrit l'utilisateur en divisant à tous les espaces.
                const tokens = currentTarget.value.trim().split(" ");
                let token = tokens[0];
                let skip = 0;
                this.criteriaList = [];

                // On parcourt les tokens et on cherche pour un token de la forme critere:valeur.
                while (1) {
                    const [crit = "", value = ""] = token?.split(/:(.+)/) || [];
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
                store.query = `${tokens.slice(skip).join(" ")}${/\s*$/.exec(currentTarget.value)![0]}`; // La regex sert à garder les espaces en plus à la fin.
            }
        },

        /** Vide la barre. */
        clear() {
            store.query = "";
            if (store.criteria && enableInputCriteria) {
                // On vide les critères que s'ils sont affichés.
                store.criteria.clear();
            }
        }
    }));

    function togglePanel() {
        setShowPanel(v => !v);
    }

    useEffect(() => {
        /** Met le focus sur la barre de recherche. */
        input.current?.focus();
        input.current?.setSelectionRange(state.text.length, state.text.length);

        /** Ferme le panel lorsqu'on clic à l'extérieur de la search bar. */
        function onDocumentClick({target}: Event) {
            let parent = target as HTMLElement | null;

            while (parent && parent.getAttribute("data-focus") !== "search-bar") {
                parent = parent.parentElement;
            }

            if (!parent) {
                setShowPanel(false);
            }
        }

        document.addEventListener("mousedown", onDocumentClick);
        return () => document.removeEventListener("mousedown", onDocumentClick);
    }, []);

    const theme = useTheme("searchBar", searchBarCss, pTheme);

    return useObserver(() => (
        <div data-focus="search-bar" style={{position: "relative"}}>
            <div className={theme.bar({error: !!state.error})}>
                <div className={theme.input()}>
                    <FontIcon className={theme.searchIcon()} icon={{i18nKey: `${i18nPrefix}.icons.searchBar.search`}} />
                    <input
                        ref={input}
                        autoComplete={uiConfig.autocompleteOffValue}
                        name="search-bar-input"
                        onChange={state.onInputChange}
                        placeholder={t(state.placeholder || "")}
                        value={state.text}
                    />
                </div>
                {state.text ? (
                    <IconButton icon={{i18nKey: `${i18nPrefix}.icons.searchBar.clear`}} onClick={state.clear} />
                ) : null}
                {!!criteriaComponent || store.availableSearchFields.length > 0 ? (
                    <Button
                        icon={{i18nKey: `${i18nPrefix}.icons.searchBar.${showPanel ? "close" : "open"}`}}
                        label={
                            store.availableSearchFields.length > 0
                                ? `(${store.searchFields?.length ?? store.availableSearchFields.length}/${
                                      store.availableSearchFields.length
                                  })`
                                : ""
                        }
                        onClick={togglePanel}
                    />
                ) : null}
            </div>
            {!showPanel && state.error ? <span className={theme.errors()}>{state.error}</span> : null}
            <AnimatePresence>
                {showPanel ? (
                    <motion.div
                        animate={{height: "auto", y: 0, overflow: "hidden", transitionEnd: {overflow: "auto"}}}
                        className={theme.panel()}
                        exit={{height: 0, y: -40, overflow: "hidden", transitionEnd: {overflow: "auto"}}}
                        initial={{height: 0, y: -40}}
                        transition={getSpringTransition()}
                    >
                        {criteriaComponent
                            ? fieldFor(
                                  makeField("query", f =>
                                      f
                                          .value(
                                              () => store.query,
                                              query => (store.query = query ?? "")
                                          )
                                          .metadata({label: `${i18nPrefix}.search.bar.query`})
                                  )
                              )
                            : null}
                        {store.availableSearchFields.length > 0 ? (
                            <div className={theme.searchFields()}>
                                <h6>{t(`${i18nPrefix}.search.bar.searchFields`)}</h6>
                                <Checkbox
                                    label={t(`${i18nPrefix}.search.bar.selectAll`)}
                                    onChange={() => {
                                        if (
                                            !store.searchFields ||
                                            store.searchFields.length === store.availableSearchFields.length
                                        ) {
                                            store.searchFields = [];
                                        } else {
                                            store.searchFields = store.availableSearchFields.map(x => x);
                                        }
                                    }}
                                    value={
                                        !store.searchFields ||
                                        store.searchFields.length === store.availableSearchFields.length
                                    }
                                />
                                <SelectCheckbox
                                    onChange={fields => (store.searchFields = fields)}
                                    showSupportingText="never"
                                    type="string-array"
                                    value={store.searchFields ?? store.availableSearchFields}
                                    values={makeReferenceList(
                                        store.availableSearchFields.map(f => ({
                                            code: f,
                                            label: searchFieldNames[f] ?? f
                                        }))
                                    )}
                                />
                            </div>
                        ) : null}
                        {criteriaComponent}
                        {criteriaComponent ? (
                            <div className={theme.buttons()}>
                                <Button label={t(`${i18nPrefix}.search.bar.reset`)} onClick={state.clear} />
                            </div>
                        ) : null}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    ));
}
