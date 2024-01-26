import {useState} from "react";

import {FloatingActionButton} from "@focus4/toolbox";

import {FloatingActionButtonMeta} from "./metas/floating-action-button";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...FloatingActionButtonMeta,
    title: "Composants/@focus4∕toolbox/FloatingActionButton",
    tags: ["autodocs"],
    args: {
        icon: "add",
        label: "Ajouter"
    }
} as Meta<typeof FloatingActionButton>;

export const Showcase: StoryObj<typeof FloatingActionButton> = {
    render(props) {
        const [extended, setExtended] = useState(false);
        return (
            <>
                <div className="container">
                    <FloatingActionButton {...props} />
                    <FloatingActionButton color="primary" extended {...props} />
                    <FloatingActionButton color="light" size="small" {...props} />
                    <FloatingActionButton color="accent" size="large" {...props} />
                </div>
                <div className="container">
                    <FloatingActionButton
                        {...props}
                        extended={extended}
                        onPointerEnter={() => setExtended(true)}
                        onPointerLeave={() => setExtended(false)}
                    />
                </div>
            </>
        );
    }
};
