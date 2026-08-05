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
        expect(container.textContent).toContain("Tag");
    });

    test("Rend un <button> quand onClick est passé", () => {
        render(<Chip label="Cliquable" onClick={() => undefined} theme={chipTheme} />);

        expect(screen.getByRole("button", {name: /Cliquable/u}).tagName).toBe("BUTTON");
    });

    test("Rend un <a> quand href est passé", () => {
        const {container} = render(<Chip href="/x" label="Lien" theme={chipTheme} />);

        expect(container.querySelector("a")?.getAttribute("href")).toBe("/x");
    });

    test("Déclenche onClick au clic sur le chip", () => {
        const onClick = vi.fn();
        render(<Chip label="Cliquable" onClick={onClick} theme={chipTheme} />);

        fireEvent.click(screen.getByRole("button", {name: /Cliquable/u}));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("Affiche l'icône passée en prop", () => {
        const {container} = render(<Chip icon="star" label="Favori" theme={chipTheme} />);

        expect(container.textContent).toContain("star");
    });

    test("Affiche le bouton de suppression quand onDeleteClick est passé", () => {
        const onDelete = vi.fn();
        const {container} = renderWithTheme(<Chip label="Removable" onDeleteClick={onDelete} theme={chipTheme} />);

        const deleteButton = container.querySelector("button")!;
        expect(deleteButton).toBeTruthy();
        fireEvent.click(deleteButton);
        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
