import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {renderWithTheme, setupComponentTest} from "../../__tests__/test-utils";
import {Chip} from "../chip";

const chipTheme = {
    chip: "chip",
    delete: "chip-delete",
    icon: "chip-icon",
    label: "chip-label"
};

describe("Chip component", () => {
    setupComponentTest();

    test("Rend un <span> quand ni onClick ni href", () => {
        const {container} = render(<Chip label="Tag" theme={chipTheme} />);

        const span = container.querySelector("span")!;
        expect(span.tagName).toBe("SPAN");
        expect(span.textContent).toBe("Tag");
    });

    test("Rend un <button> quand onClick est passé", () => {
        render(<Chip label="Cliquable" onClick={() => undefined} theme={chipTheme} />);

        expect(screen.getByRole("button", {name: /Cliquable/u}).tagName).toBe("BUTTON");
    });

    test("Rend un <a> quand href est passé", () => {
        render(<Chip href="/x" label="Lien" theme={chipTheme} />);

        expect((screen.getByRole("link", {name: "Lien"}) as HTMLAnchorElement).pathname).toBe("/x");
    });

    test("Déclenche onClick au clic sur le chip", () => {
        const onClick = vi.fn();
        render(<Chip label="Cliquable" onClick={onClick} theme={chipTheme} />);

        fireEvent.click(screen.getByRole("button", {name: /Cliquable/u}));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("Affiche l'icône passée en prop", () => {
        render(<Chip icon="star" label="Favori" theme={chipTheme} />);

        expect([screen.getByText("star").textContent, screen.getByText("Favori").textContent]).toEqual([
            "star",
            "Favori"
        ]);
    });

    test("Affiche le bouton de suppression quand onDeleteClick est passé", () => {
        const onDelete = vi.fn();
        renderWithTheme(<Chip label="Removable" onDeleteClick={onDelete} theme={chipTheme} />);

        const deleteButton = screen.getByRole("button");
        fireEvent.click(deleteButton);
        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
