// Libs
import {mount} from "enzyme";
import * as React from "react";
import {Panel} from "../panel";

// Components
describe("Panel component", () => {
    it("with title", () => {
        // Arrange/Act
        const panel = mount(<Panel title="A title for a test" />);
        // Assert
        const h3List = panel.getDOMNode().querySelectorAll("h3");
        expect(h3List).toHaveLength(1);
    });
});
