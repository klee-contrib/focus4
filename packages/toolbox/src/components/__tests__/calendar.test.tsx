import {fireEvent, screen, waitFor} from "@testing-library/react";
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
});
