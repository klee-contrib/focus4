import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen, waitFor} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {i18nCollections} from "../../translation";
import {SearchChip} from "../chip";

describe("SearchChip", () => {
    setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

    test("affiche les valeurs inversées et supprime le chip", () => {
        const onDeleteClick = vi.fn();

        renderWithTheme(
            <SearchChip
                code="status"
                codeLabel="Status"
                deletable
                onDeleteClick={onDeleteClick}
                type="facet"
                valueOperator="and"
                values={[
                    {code: "active", label: "Active"},
                    {code: "archived", invert: true}
                ]}
            />
        );

        expect(screen.getByText('Status : "Active" et non "archived"')).toBeTruthy();
        fireEvent.click(screen.getByRole("button"));
        expect(onDeleteClick).toHaveBeenCalledOnce();
    });

    test("remplace les libellés avec le resolver et fusionne le thème", async () => {
        const resolver = vi.fn().mockResolvedValue("Resolved");
        const themer = vi.fn().mockReturnValue({chip: "custom-chip"});

        renderWithTheme(
            <SearchChip
                code="category"
                codeLabel="Category"
                keyResolver={resolver}
                themer={themer}
                theme={{chip: "base-chip"}}
                type="filter"
                values={[{code: "a", label: "A"}]}
            />
        );

        await waitFor(() => expect(screen.getByText('Category : "Resolved"')).toBeTruthy());
        expect(resolver).toHaveBeenCalledWith("filter", "category", "a");
        expect(themer).toHaveBeenCalledWith("filter", "category", ["a"]);
    });

    test("utilise le libellé du code sans valeur et ne rend pas de suppression", () => {
        renderWithTheme(<SearchChip code="sort" codeLabel="Sort" type="sort" />);

        expect(screen.getByText("Sort")).toBeTruthy();
        expect(screen.queryByRole("button")).toBeNull();
    });

    test("conserve le libellé initial quand le resolver ne renvoie rien", async () => {
        const resolver = vi.fn().mockResolvedValue(undefined);

        renderWithTheme(
            <SearchChip
                code="category"
                codeLabel="Category"
                keyResolver={resolver}
                type="facet"
                values={[{code: "a"}]}
            />
        );

        await waitFor(() => expect(screen.getByText('Category : "a"')).toBeTruthy());
        expect(resolver).toHaveBeenCalledWith("facet", "category", "a");
    });

    test("n'appelle pas le resolver pour un chip de tri", () => {
        const resolver = vi.fn();

        renderWithTheme(
            <SearchChip
                code="name"
                codeLabel="Name"
                keyResolver={resolver}
                type="sort"
                values={[{code: "ascending"}]}
            />
        );

        expect(screen.getByText('Name : "ascending"')).toBeTruthy();
        expect(resolver).not.toHaveBeenCalled();
    });
});
