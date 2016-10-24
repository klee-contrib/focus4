import * as i18n from "i18next";
import {map} from "lodash";
import * as React from "react";

import Button from "focus-components/button";

import {topicDisplayer, button} from "./style/topic-displayer.css";

function topicClickHandler(key: string, topicClickAction: (key: string) => void) {
    topicClickAction(key);
}

export function TopicDisplayer({displayLabels = false, topicList = {}, topicClickAction = () => null}: {
    displayLabels?: boolean,
    topicList?: {[key: string]: {code: string, label: string, value: string}},
    topicClickAction?: (key: string) => void
}) {
    return (
        <div className={topicDisplayer}>
            {map(topicList, (topic, key) => {
                const text = displayLabels ? `${i18n.t(topic.label)}: ${i18n.t(topic.value)}` : i18n.t(topic.value);
                return (
                    <Button
                        className={button}
                        handleOnClick={() => {topicClickHandler(key!, topicClickAction);}}
                        icon="clear"
                        key={key!}
                        label={text}
                    />
                );
            })}
        </div>
    );
}
