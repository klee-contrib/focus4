import i18n from "i18next";
import {map} from "lodash";
import * as React from "react";

import Button from "focus-components/button";

import {injectStyle} from "../../theming";

import * as styles from "./style/topic-displayer.css";
export type TopicDisplayerStyle = Partial<typeof styles>;

function topicClickHandler(key: string, topicClickAction: (key: string) => void) {
    topicClickAction(key);
}

export const TopicDisplayer = injectStyle("topicDisplayer", ({classNames, displayLabels = true, topicList = {}, topicClickAction = () => null}: {
    classNames?: TopicDisplayerStyle,
    displayLabels?: boolean,
    topicList?: {[key: string]: {code: string, label: string, value: string}},
    topicClickAction?: (key: string) => void
}) => (
        <div className={`${styles.topicDisplayer} ${classNames!.topicDisplayer || ""}`}>
            {map(topicList, (topic, key) => {
                const text = displayLabels ? `${i18n.t(topic.label)} - ${topic.value}` : i18n.t(topic.value);
                return (
                    <Button
                        className={`${styles.button} ${classNames!.button || ""}`}
                        handleOnClick={() => topicClickHandler(key!, topicClickAction)}
                        icon="clear"
                        key={key!}
                        label={text}
                    />
                );
            })}
        </div>
    )
);
