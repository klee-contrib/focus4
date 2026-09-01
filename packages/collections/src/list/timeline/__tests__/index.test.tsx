import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import {z} from "zod";

import type {FieldEntry} from "@focus4/entities";
import type {EntityField} from "@focus4/stores";

import {i18nCollections} from "../../../translation";
import {Timeline, timelineFor} from "../index";

setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

interface Item {
    date: string;
    id: number;
    name: string;
}

const items: Item[] = [
    {date: "2024-01-01", id: 1, name: "Alpha"},
    {date: "2024-01-02", id: 2, name: "Beta"}
];

const timelineTheme = {
    add: "timeline-add",
    badge: "timeline-badge",
    date: "timeline-date",
    panel: "timeline-panel",
    timeline: "timeline"
};

const baseTheme = {
    bottomRow: "timeline-bottom-row",
    items: "timeline-items",
    loading: "timeline-loading",
    navigation: "timeline-navigation"
};

const dateField = {
    $field: {
        domain: {schema: z.string()},
        isRequired: false,
        label: "Date",
        name: "date",
        type: "field"
    },
    value: "2024-01-01"
} as unknown as EntityField<FieldEntry>;

function Line({data}: {data: Item}) {
    return <span>{data.name}</span>;
}

function dateSelector() {
    return dateField;
}

describe("Timeline", () => {
    test("affiche les dates, les lignes et le bouton d'ajout", () => {
        const addItemHandler = vi.fn();
        renderWithTheme(
            <Timeline
                addItemHandler={addItemHandler}
                baseTheme={baseTheme}
                data={items}
                dateSelector={dateSelector}
                itemKey={item => item.id}
                theme={timelineTheme}
                TimelineComponent={Line}
            />
        );

        expect(screen.getByText("Alpha").textContent).toBe("Alpha");
        expect(screen.getAllByText("2024-01-01")).toHaveLength(2);
        fireEvent.click(screen.getByRole("button", {name: /Ajouter/}));
        expect(addItemHandler).toHaveBeenCalledOnce();
    });

    test("affiche le composant vide quand aucune donnée n'est disponible", () => {
        renderWithTheme(
            <Timeline
                baseTheme={baseTheme}
                data={[]}
                dateSelector={dateSelector}
                EmptyComponent={() => <div>Vide</div>}
                itemKey={(item: Item) => item.id}
                theme={timelineTheme}
                TimelineComponent={Line}
            />
        );

        expect(screen.getByText("Vide").textContent).toBe("Vide");
        expect(screen.queryByRole("list")).toBeNull();
    });

    test("expose le wrapper timelineFor", () => {
        renderWithTheme(
            timelineFor({
                baseTheme,
                data: items,
                dateSelector,
                itemKey: item => item.id,
                theme: timelineTheme,
                TimelineComponent: Line
            })
        );

        const list = screen.getByRole("list");
        expect(screen.getByText("Beta").closest("ul")).toBe(list);
    });
});
