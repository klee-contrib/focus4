import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen, waitFor} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {InputFile} from "../input-file";

setupComponentTest({
    focus: {
        file: {
            existing: "Le fichier {{file}} existe.",
            invalid: "Le fichier {{file}} est invalide.",
            upload: "Télécharger"
        },
        icons: {file: {delete: "delete", line: "insert_drive_file", upload: "upload_file"}}
    }
});

const theme = {
    container: "input-file-container",
    "container--disabled": "input-file-disabled",
    "container--dragOver": "input-file-drag-over",
    field: "input-file-field",
    "field--error": "input-file-error",
    file: "input-file-file",
    input: "input-file-input",
    text: "input-file-text",
    supportingText: "input-file-supporting-text",
    "supportingText--disabled": "input-file-supporting-disabled",
    "supportingText--error": "input-file-supporting-error"
};

describe("InputFile", () => {
    test("ajoute puis supprime un fichier unique", () => {
        const onChange = vi.fn();
        const file = new File(["contenu"], "rapport.txt", {type: "text/plain"});
        renderWithTheme(<InputFile maxFiles={1} onChange={onChange} theme={theme} />);

        fireEvent.change(screen.getByLabelText("Télécharger"), {target: {files: [file]}});
        expect(screen.getByText("rapport.txt").textContent).toBe("rapport.txt");
        expect(onChange).toHaveBeenCalledWith(file);

        fireEvent.click(screen.getByRole("button"));
        expect(screen.queryByText("rapport.txt")).toBeNull();
        expect(onChange).toHaveBeenLastCalledWith(undefined);
    });

    test("affiche une valeur initiale et limite le nombre de fichiers", () => {
        const first = new File(["a"], "a.txt", {type: "text/plain"});
        const second = new File(["b"], "b.txt", {type: "text/plain"});
        const onChange = vi.fn();
        renderWithTheme(<InputFile maxFiles={2} onChange={onChange} value={[first]} theme={theme} />);

        const input = screen.getByDisplayValue("") as HTMLInputElement;
        fireEvent.change(input, {target: {files: [second]}});
        expect(screen.getByText("a.txt").textContent).toBe("a.txt");
        expect(screen.getByText("b.txt").textContent).toBe("b.txt");
        expect(onChange).toHaveBeenCalledWith([first, second]);
    });

    test("rejette les doublons et les types non autorisés", async () => {
        const file = new File(["a"], "a.txt", {type: "text/plain"});
        const onChange = vi.fn();
        renderWithTheme(<InputFile<1> accept=".pdf" maxFiles={1} onChange={onChange} value={file} theme={theme} />);

        fireEvent.change(screen.getByDisplayValue(""), {target: {files: [file]}});
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByText("a.txt").textContent).toBe("a.txt");
    });

    test("accepte un fichier valide déposé et gère les états de drag", async () => {
        const onChange = vi.fn();
        const file = new File(["a"], "note.txt", {type: "text/plain"});
        const {container} = renderWithTheme(
            <InputFile accept="text/*,.txt" maxFiles={2} onChange={onChange} theme={theme} />
        );
        const label = container.querySelector("label")!;

        fireEvent.dragEnter(label);
        expect(label.classList.contains("input-file-drag-over")).toBe(true);
        fireEvent.dragOver(label);
        fireEvent.dragLeave(label);
        expect(label.classList.contains("input-file-drag-over")).toBe(false);
        fireEvent.drop(label, {dataTransfer: {files: [file]}});

        await waitFor(() => expect(onChange).toHaveBeenCalledWith([file]));
        expect(screen.getByText("note.txt")).toBeTruthy();
        expect(label.classList.contains("input-file-drag-over")).toBe(false);
    });

    test("ouvre le sélecteur avec Entrée et applique l'icône personnalisée", () => {
        const file = new File(["a"], "note.txt", {type: "text/plain"});
        const icon = {className: "", name: "article"};
        const {container} = renderWithTheme(
            <InputFile iconSelector={() => icon} maxFiles={1} value={file} theme={theme} />
        );
        const label = container.querySelector("label")!;
        const input = screen.getByDisplayValue("") as HTMLInputElement;
        const click = vi.spyOn(input, "click");

        fireEvent.keyDown(label, {key: "Enter"});
        fireEvent.keyDown(label, {key: "Escape"});

        expect(click).toHaveBeenCalledOnce();
        expect(screen.getByText("article").textContent).toBe("article");
    });
});
