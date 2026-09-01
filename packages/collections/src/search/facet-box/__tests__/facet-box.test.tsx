import {defaultAppTheme, renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen, within} from "@testing-library/react";
import {describe, expect, test} from "vitest";
import z from "zod";

import {domain} from "@focus4/form-toolbox";
import {type FormEntityField, makeField, makeLocalCollectionStore} from "@focus4/stores";
import {ThemeProvider} from "@focus4/styling";

import {FacetBox, type FacetBoxProps} from "..";
import {i18nCollections} from "../../../translation";

setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

interface Item {
    category: string;
    tags: string[];
}

function createStore() {
    const store = makeLocalCollectionStore<Item>({
        facetDefinitions: [
            {canExclude: true, code: "category", fieldName: "category", isMultiSelectable: true, label: "Category"},
            {code: "tags", fieldName: "tags", isMultiSelectable: true, label: "Tags"}
        ]
    });
    store.list = [
        {category: "A", tags: ["one", "two"]},
        {category: "A", tags: ["one"]},
        {category: "B", tags: ["two"]},
        {category: "C", tags: ["three"]},
        {category: "C", tags: ["three", "four"]}
    ];
    return store;
}

function renderFacetBox(props: Partial<FacetBoxProps<Item>> = {}) {
    const store = createStore();
    renderWithTheme(
        <ThemeProvider
            appTheme={{
                ...defaultAppTheme,
                facet: {
                    checkbox: "facet-checkbox",
                    "checkbox--selected": "facet-checkbox-selected",
                    count: "facet-count",
                    facet: "facet",
                    icon: "facet-icon",
                    label: "facet-label",
                    "label--excluded": "facet-label-excluded",
                    show: "facet-show"
                }
            }}
        >
            <FacetBox store={store} theme={{facetBox: "facet-box", section: "facet-section"}} {...props} />
        </ThemeProvider>
    );
    return store;
}

function getFacetBox() {
    const facetBox = screen.getByRole("heading", {level: 3}).parentElement;
    if (!(facetBox instanceof HTMLDivElement)) {
        throw new Error("Facet box container not found");
    }
    return facetBox;
}

const facetLabels = {category: "Category", tags: "Tags"} as const;

function getFacet(code: keyof typeof facetLabels) {
    const facet = screen.getByRole("heading", {level: 4, name: new RegExp(`${facetLabels[code]}$`)}).parentElement;
    if (!(facet instanceof HTMLDivElement) || facet.dataset.facet !== code) {
        throw new Error(`Facet ${code} not found`);
    }
    return facet;
}

describe("FacetBox", () => {
    test("affiche les facettes visibles et leurs valeurs", () => {
        renderFacetBox();

        const heading = screen.getByRole("heading", {level: 3});
        expect(screen.getByText("Filtrer").parentElement).toBe(heading);
        expect([getFacet("category").dataset.facet, getFacet("tags").dataset.facet]).toEqual(["category", "tags"]);
        for (const text of ["A", "four"]) {
            expect(screen.getByText(text).textContent).toBe(text);
        }
    });

    test("affiche une facette additionnelle à la position demandée", () => {
        renderFacetBox({
            additionalFacets: {
                extra: {
                    Component: ({facet}) => <div data-testid="additional-facet">{facet.label}</div>,
                    position: 1
                }
            }
        });

        const facetBox = getFacetBox();
        expect((facetBox.children[1] as HTMLElement).dataset.facet).toBe("category");
        const additionalFacet = screen.getByTestId("additional-facet");
        expect(additionalFacet.textContent).toBe("extra");
        expect(facetBox.children[2]).toBe(additionalFacet);
    });

    test("organise les facettes dans les sections configurées", () => {
        renderFacetBox({sections: [{facets: ["tags"], name: "Secondary"}, {name: "Remaining"}]});

        const secondarySection = screen.getByRole("heading", {level: 5, name: "Secondary"}).parentElement;
        const remainingSection = screen.getByRole("heading", {level: 4, name: "Remaining"}).parentElement;
        expect(getFacet("tags").parentElement).toBe(secondarySection);
        expect(getFacet("category").parentElement).toBe(remainingSection);
    });

    test("bascule l'ouverture globale et l'expansion d'une facette", () => {
        renderFacetBox({defaultFacetState: "collapsed", nbDefaultDataList: 2});

        expect(screen.queryByText("A")).toBeNull();
        fireEvent.click(screen.getByRole("heading", {level: 3}));
        expect(screen.getByText("A").textContent).toBe("A");
        expect(screen.queryByText("B")).toBeNull();

        const categoryFacet = getFacet("category");
        const showButton = within(categoryFacet).getByRole("button", {name: "Voir tout"});
        fireEvent.click(showButton);
        expect(screen.getByText("B").textContent).toBe("B");
        fireEvent.click(within(categoryFacet).getByRole("button", {name: "Voir moins"}));
        expect(screen.queryByText("B")).toBeNull();
    });

    test("sélectionne une valeur puis efface les facettes et les champs additionnels", () => {
        const field = makeField("extra", builder =>
            builder.domain(domain(z.string())).value("initial")
        ) as FormEntityField;
        field.value = "initial";
        const store = renderFacetBox({
            additionalFacets: {
                extra: {
                    Component: ({facet}) => <div data-testid="additional-facet">{facet.label}</div>,
                    fields: [field],
                    initialValues: ["initial"]
                }
            }
        });

        fireEvent.click(screen.getByText("A"));
        field.value = "changed";
        expect(store.inputFacets.category?.selected).toEqual(["A"]);
        const heading = screen.getByRole("heading", {level: 3});
        const clearButton = within(heading).getByRole("button", {name: "clear"});
        expect(clearButton.parentElement).toBe(heading);

        fireEvent.click(clearButton);
        expect(store.inputFacets).toEqual({});
        expect(field.value).toBe("initial");
    });

    test("rejette plusieurs sections de facettes non renseignées", () => {
        expect(() =>
            renderFacetBox({
                sections: [{name: "First"}, {name: "Second"}]
            })
        ).toThrow("Il ne peut y avoir qu'une seule section de facettes non renseignées.");
    });
});
