import {useState} from "react";

import {Slider} from "@focus4/toolbox";

import {SliderMeta} from "./metas/slider";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SliderMeta,
    title: "Composants/@focus4∕toolbox/Slider",
    tags: ["autodocs"]
} as Meta<typeof Slider>;

export const Showcase: StoryObj<Partial<typeof Slider>> = {
    render(props) {
        const [selected, setSelected] = useState(23);
        const [selected2, setSelected2] = useState(45);
        return (
            <div className="stack">
                <Slider labeled value={selected} {...props} onChange={setSelected} />
                <Slider step={5} ticks value={selected2} {...props} onChange={setSelected2} />
            </div>
        );
    }
};
