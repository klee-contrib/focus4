// Libs
import {mount} from "enzyme";
import i18next from "i18next";
import * as React from "react";
import {Panel} from "../panel";

i18next.init();

// Components
describe("Title", () => {
    test("with title", () => {
        // Arrange/Act
        const panelTitle = "A title for a test";
        const panel = mount(<Panel title={panelTitle} />);

        // Assert that the title is present
        const h3List = panel.getDOMNode().querySelectorAll("h3");
        expect(h3List).toHaveLength(1);
        expect(h3List[0].textContent).toContain(panelTitle);
    });
});

// Top div wrapper is always present because the title is wrapped in it

test.each([["none", 1, 0], ["top", 1, 0], ["bottom", 1, 1], ["both", 1, 1]])(
    "Buttons positions %s / expectedTop : %i / expectedBottom : %i",
    (position: any, expectedTop, expectedBottom) => {
        const panel = mount(
            <Panel
                title="my panel"
                buttonsPosition={position}
                theme={{"title--top": "topClassName", "title--bottom": "bottomClassName"}}
            />
        );
        expect(panel.find(".topClassName").length).toBe(expectedTop);
        expect(panel.find(".bottomClassName").length).toBe(expectedBottom);
    }
);
