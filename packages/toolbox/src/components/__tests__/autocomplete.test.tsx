import {fireEvent, screen} from "@testing-library/react";
import {ReactElement} from "react";
import {describe, expect, test, vi} from "vitest";

import {ThemeProvider} from "@focus4/styling";

import {defaultAppTheme, renderWithTheme, setupComponentTest} from "../../__tests__/test-utils";
import {Autocomplete} from "../autocomplete";

const values = [
    {key: "one", label: "Un"},
    {key: "two", label: "Deux"},
    {key: "three", label: "Trois"}
];

const autocompleteTheme = {
    autocomplete: "autocomplete",
    "autocomplete--singleLine": "autocomplete-single-line",
    suggestion: "suggestion",
    "suggestion--active": "suggestion-active",
    "suggestion--disabled": "suggestion-disabled"
};

const menuTheme = {
    caption: "menu-caption",
    focus: "menu-focus",
    icon: "menu-icon",
    item: "menu-item",
    "item--focused": "menu-item-focused",
    menu: "menu",
    "menu--active": "menu-active",
    "menu--full": "menu-full",
    menuItem: "menu-menu-item",
    "menuItem--disabled": "menu-menu-item-disabled"
};

function renderAutocomplete(ui: ReactElement) {
    return renderWithTheme(
        <ThemeProvider appTheme={{...defaultAppTheme, autocomplete: autocompleteTheme, menu: menuTheme}}>
            {ui}
        </ThemeProvider>
    );
}

function getInput() {
    return screen.getByRole("combobox") as HTMLInputElement;
}

describe("Autocomplete component", () => {
    setupComponentTest();

    test("Rend la valeur sélectionnée et ouvre les suggestions au focus", () => {
        renderAutocomplete(<Autocomplete id="numbers" value="one" values={values} />);

        expect(getInput().value).toBe("Un");
        expect(getInput().ariaExpanded).toBe("false");

        fireEvent.focus(getInput());

        expect(getInput().ariaExpanded).toBe("true");
        expect(screen.getAllByRole("option").map(option => option.ariaLabel)).toEqual(["Un"]);
    });

    test("Filtre les suggestions lorsque la query change", () => {
        renderAutocomplete(<Autocomplete values={values} />);
        const input = getInput();

        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: "de"}});

        expect(input.value).toBe("de");
        expect(screen.getAllByRole("option").map(option => option.ariaLabel)).toEqual(["Deux", "Deux", "Trois"]);
        expect(screen.queryByRole("option", {name: "Un"})).toBeNull();
    });

    test("Sélectionne une suggestion au clic et peut vider la query", () => {
        const onChange = vi.fn();
        renderAutocomplete(<Autocomplete clearQueryOnChange onChange={onChange} values={values} />);
        const input = getInput();

        fireEvent.focus(input);
        fireEvent.click(screen.getByRole("option", {name: "Deux"}));

        expect(onChange).toHaveBeenCalledWith("two", values[1]);
        expect(input.value).toBe("");
        expect(input.ariaExpanded).toBe("false");
    });

    test("Confirme la première suggestion avec Entrée", () => {
        const onChange = vi.fn();
        renderAutocomplete(<Autocomplete onChange={onChange} values={values} />);
        const input = getInput();

        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: "tr"}});
        fireEvent.keyDown(input, {key: "Enter"});

        expect(onChange).toHaveBeenCalledWith("three", values[2]);
        expect(input.value).toBe("Trois");
        expect(input.ariaExpanded).toBe("false");
    });

    test("Efface une query non correspondante au blur", () => {
        const onChange = vi.fn();
        renderAutocomplete(<Autocomplete onChange={onChange} values={values} />);
        const input = getInput();

        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: "inconnu"}});
        fireEvent.keyDown(input, {key: "Escape"});
        expect(input.ariaExpanded).toBe("false");

        fireEvent.blur(input);

        expect(input.value).toBe("");
        expect(onChange).toHaveBeenCalledWith(undefined, undefined);
    });

    test("Déclenche l'action d'une suggestion complémentaire", () => {
        const onClick = vi.fn();
        renderAutocomplete(
            <Autocomplete additionalSuggestions={[{content: "Ajouter", key: "add", onClick}]} values={values} />
        );
        const input = getInput();

        fireEvent.focus(input);
        fireEvent.click(screen.getByRole("option", {name: "Ajouter"}));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    /*
     * La query est saisie avant le focus : le menu n'est ouvert qu'ensuite, donc la liste rendue ne contient que les
     * suggestions filtrées, sans les éléments en cours d'animation de sortie.
     */
    test.each([
        ["start", "un", ["Un grand nombre"]],
        ["start", "grand", []],
        ["anywhere", "grand", ["Un grand nombre"]],
        ["anywhere", "rand", ["Un grand nombre"]],
        ["word", "grand", ["Un grand nombre"]],
        ["word", "rand", []],
        ["disabled", "zzz", ["Un grand nombre", "Deux", "Trois"]]
    ] as const)("le mode de correspondance %s sur '%s' ne garde que %j", (suggestionMatch, query, expected) => {
        renderAutocomplete(
            <Autocomplete
                suggestionMatch={suggestionMatch}
                values={[{key: "one", label: "Un grand nombre"}, ...values.slice(1)]}
            />
        );
        const input = getInput();

        fireEvent.change(input, {target: {value: query}});
        fireEvent.focus(input);

        expect(screen.queryAllByRole("option").map(option => option.ariaLabel)).toEqual(expected);
    });

    test("masque les suggestions tant que la query est vide", () => {
        renderAutocomplete(<Autocomplete noSuggestionsOnEmptyQuery values={values} />);
        const input = getInput();

        fireEvent.focus(input);
        expect(screen.queryAllByRole("option")).toHaveLength(0);

        fireEvent.change(input, {target: {value: "de"}});
        expect(screen.getByRole("option", {name: "Deux"})).toBeTruthy();
    });

    test("accepte une valeur non proposée avec allowUnmatched", () => {
        const onChange = vi.fn();
        renderAutocomplete(<Autocomplete allowUnmatched onChange={onChange} values={values} />);
        const input = getInput();

        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: "Custom"}});
        fireEvent.keyDown(input, {key: "Enter"});

        expect(onChange).toHaveBeenCalledWith("Custom", undefined);
        expect(input.value).toBe("Custom");
    });

    test("propage une query contrôlée sans la stocker et limite le nombre de suggestions", () => {
        const onQueryChange = vi.fn();
        renderAutocomplete(<Autocomplete maxDisplayed={1} onQueryChange={onQueryChange} query="" values={values} />);
        const input = getInput();

        fireEvent.focus(input);
        expect(screen.getAllByRole("option").map(option => option.ariaLabel)).toEqual(["Un"]);

        fireEvent.change(input, {target: {value: "de"}});

        expect(onQueryChange).toHaveBeenCalledWith("de");
        // La query est pilotée par le parent : sans mise à jour de la prop, le champ reste vide.
        expect(input.value).toBe("");
    });

    test("affiche une suggestion désactivée et conserve le menu ouvert", () => {
        const onChange = vi.fn();
        renderAutocomplete(<Autocomplete disabled={["two"]} noCloseOnChange onChange={onChange} values={values} />);
        const input = getInput();

        fireEvent.focus(input);
        expect(screen.getByRole("option", {name: "Deux"}).classList.contains("suggestion-disabled")).toBe(true);
        fireEvent.click(screen.getByRole("option", {name: "Un"}));

        expect(onChange).toHaveBeenCalledWith("one", values[0]);
        expect(input.ariaExpanded).toBe("true");
    });

    test("confirme la suggestion sélectionnée avec Tab", () => {
        const onChange = vi.fn();
        renderAutocomplete(<Autocomplete onChange={onChange} values={values} />);
        const input = getInput();

        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: "u"}});
        fireEvent.keyDown(input, {key: "Tab"});

        expect(onChange).toHaveBeenCalledWith("one", values[0]);
        expect(input.value).toBe("Un");
        expect(input.ariaExpanded).toBe("false");
    });
});
