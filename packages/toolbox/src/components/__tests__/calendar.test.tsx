import {fireEvent, screen, waitFor} from "@testing-library/react";
import {range} from "es-toolkit";
import {DateTime} from "luxon";
import {describe, expect, test, vi} from "vitest";

import {renderWithTheme, setupComponentTest} from "../../__tests__/test-utils";
import {Calendar} from "../calendar";

const calendarTheme = {
    calendar: "calendar",
    controls: "calendar-controls",
    day: "calendar-day",
    "day--outside": "calendar-day-outside",
    days: "calendar-days",
    header: "calendar-header",
    main: "calendar-main",
    month: "calendar-month",
    "month--outside": "calendar-month-outside",
    months: "calendar-months",
    weekday: "calendar-weekday",
    weekdays: "calendar-weekdays",
    year: "calendar-year",
    "year--outside": "calendar-year-outside",
    years: "calendar-years"
};

function headerLabel() {
    return document.querySelector(".calendar-header .btn-label")!.textContent;
}

function clickHeader() {
    fireEvent.click(document.querySelector<HTMLButtonElement>(".calendar-header button")!);
}

function displayedDates(view: "days" | "months" | "years") {
    return [...document.querySelectorAll(`.calendar-${view} [data-date]`)].map(d => (d as HTMLElement).dataset.date);
}

describe("Calendar component", () => {
    setupComponentTest();

    test("affiche six semaines et sélectionne une date", () => {
        const onChange = vi.fn();

        renderWithTheme(
            <Calendar onChange={onChange} referenceValue="2020-03-15" theme={calendarTheme} value="2020-03-15" />
        );

        expect(document.querySelectorAll("[data-date]")).toHaveLength(42);
        expect(screen.getByRole("button", {name: "15"}).dataset.date).toBe("2020-03-15");

        fireEvent.click(screen.getByRole("button", {name: "16"}));

        expect(onChange).toHaveBeenCalledWith("2020-03-16", true);
    });

    test("désactive les dates hors des bornes min et max", () => {
        renderWithTheme(
            <Calendar max="2020-03-20" min="2020-03-10" referenceValue="2020-03-15" theme={calendarTheme} />
        );

        expect(
            ["2020-03-09", "2020-03-10", "2020-03-20", "2020-03-21"].map(
                date => document.querySelector<HTMLButtonElement>(`[data-date='${date}']`)!.disabled
            )
        ).toEqual([true, false, false, true]);
    });

    test("permet de passer des jours aux mois puis de revenir aux jours", () => {
        renderWithTheme(<Calendar referenceValue="2020-03-15" theme={calendarTheme} />);

        fireEvent.click(screen.getByRole("button", {name: /mars 2020/i}));
        expect(document.querySelectorAll(".calendar-months [data-date]")).toHaveLength(12);

        fireEvent.click(screen.getByRole("button", {name: "mars"}));
        expect(document.querySelectorAll(".calendar-days [data-date]")).toHaveLength(42);
    });

    test("déplace le focus d'un jour avec ArrowRight", async () => {
        renderWithTheme(<Calendar referenceValue="2020-03-15" theme={calendarTheme} value="2020-03-15" />);

        const calendar = document.querySelector(".calendar")!;
        fireEvent.focus(calendar);
        fireEvent.keyDown(document, {key: "ArrowRight"});

        await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", {name: "16"})));
    });

    test("sélectionne directement une année avec le format yyyy", () => {
        const onChange = vi.fn();

        renderWithTheme(
            <Calendar format="yyyy" onChange={onChange} referenceValue="2020-03-15" theme={calendarTheme} />
        );

        const year = document.querySelector<HTMLButtonElement>("[data-date='2020']")!;
        expect(year).toBeTruthy();
        fireEvent.click(year);

        expect(onChange).toHaveBeenCalledWith("2020", true);
    });

    test("navigue des jours aux mois puis aux années, et redescend en sélectionnant une année", () => {
        renderWithTheme(<Calendar referenceValue="2020-03-15" theme={calendarTheme} />);

        expect(headerLabel()).toBe("Mars 2020");

        clickHeader();
        expect([headerLabel(), displayedDates("months").length]).toEqual(["2020", 12]);

        clickHeader();
        expect(headerLabel()).toBe("2020 - 2029");
        // La décennie est complétée par l'année précédente et la suivante pour remplir les lignes de trois.
        expect(displayedDates("years")).toEqual(range(12).map(i => `${2019 + i}`));

        fireEvent.click(document.querySelector<HTMLButtonElement>(".calendar-years [data-date='2019']")!);
        expect([headerLabel(), displayedDates("months")[0]]).toEqual(["2019", "2019-01"]);
    });

    test.each([
        ["yyyy-MM-dd", "Mars 2020", "Février 2020"],
        ["yyyy-MM", "2020", "2019"],
        ["yyyy", "2020 - 2029", "2010 - 2019"]
    ] as const)("les contrôles décalent la période affichée au format %s", (format, initial, previous) => {
        renderWithTheme(<Calendar format={format} referenceValue="2020-03-15" theme={calendarTheme} />);
        const [up, down] = document.querySelectorAll<HTMLButtonElement>(".calendar-controls button");

        expect(headerLabel()).toBe(initial);

        fireEvent.click(up);
        expect(headerLabel()).toBe(previous);

        fireEvent.click(down);
        expect(headerLabel()).toBe(initial);
    });

    test("déplace la date focusée avec les flèches verticales et change de mois avec les touches page", async () => {
        renderWithTheme(<Calendar referenceValue="2020-03-15" theme={calendarTheme} value="2020-03-15" />);

        fireEvent.focus(document.querySelector(".calendar")!);

        fireEvent.keyDown(document, {key: "ArrowDown"});
        await waitFor(() => expect((document.activeElement as HTMLElement).dataset.date).toBe("2020-03-22"));

        fireEvent.keyDown(document, {key: "ArrowUp"});
        await waitFor(() => expect((document.activeElement as HTMLElement).dataset.date).toBe("2020-03-15"));

        fireEvent.keyDown(document, {key: "PageDown"});
        expect(headerLabel()).toBe("Avril 2020");

        fireEvent.keyDown(document, {key: "PageUp"});
        expect(headerLabel()).toBe("Mars 2020");
    });

    test("retombe sur le mois courant quand la référence et la valeur sont invalides", () => {
        renderWithTheme(<Calendar referenceValue="invalid-date" theme={calendarTheme} value="invalid-date" />);

        const today = DateTime.now().setLocale("fr");
        expect(displayedDates("days")).toHaveLength(42);
        expect(headerLabel()!.toLowerCase()).toBe(today.toLocaleString({month: "long", year: "numeric"}));
        expect(displayedDates("days")).toContain(today.toFormat("yyyy-MM-dd"));
    });

    test("sélectionne directement un mois avec le format yyyy-MM", () => {
        const onChange = vi.fn();
        renderWithTheme(
            <Calendar format="yyyy-MM" onChange={onChange} referenceValue="2020-03-15" theme={calendarTheme} />
        );

        expect(displayedDates("months")).toHaveLength(12);
        fireEvent.click(document.querySelector<HTMLButtonElement>(".calendar-months [data-date='2020-04']")!);

        expect(onChange).toHaveBeenCalledWith("2020-04", true);
    });

    test("remonte de vue en vue avec Backspace et s'arrête sur les années", () => {
        renderWithTheme(<Calendar referenceValue="2020-03-15" theme={calendarTheme} />);

        fireEvent.focus(document.querySelector(".calendar")!);

        fireEvent.keyDown(document, {key: "Backspace"});
        expect(headerLabel()).toBe("2020");

        fireEvent.keyDown(document, {key: "Backspace"});
        expect(headerLabel()).toBe("2020 - 2029");

        fireEvent.keyDown(document, {key: "Backspace"});
        expect(headerLabel()).toBe("2020 - 2029");
    });

    test.each([false, true])("hideReferenceValue=%s met en avant (ou non) la date de référence", hide => {
        renderWithTheme(
            <Calendar hideReferenceValue={hide} referenceValue="2020-03-15" theme={calendarTheme} value={undefined} />
        );

        const reference = document.querySelector(".calendar-days [data-date='2020-03-15']")!;
        expect([reference.classList.contains("btn-outlined"), reference.classList.contains("btn-primary")]).toEqual([
            !hide,
            !hide
        ]);
    });
});
