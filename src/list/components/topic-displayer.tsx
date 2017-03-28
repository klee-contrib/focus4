import i18n from "i18next";
import {map} from "lodash";
import * as React from "react";

import Chips from "focus-components/chips";

import {injectStyle} from "../../theming";

import * as styles from "./style/topic-displayer.css";
export type TopicDisplayerStyle = Partial<typeof styles>;

export const TopicDisplayer = injectStyle("topicDisplayer", ({classNames, topicList = {}, topicClickAction = () => null}: {
    classNames?: TopicDisplayerStyle,
    topicList?: {[key: string]: {code: string, label?: string, value: string}},
    topicClickAction?: (key: string) => void
}) => (
        <div className={`${styles.container} ${classNames!.container || ""}`}>
            {map(topicList, (topic, key) => {
                const text = topic.label ? `${i18n.t(topic.label)}: ${topic.value}` : i18n.t(topic.value);
                return (
                    <Chips
                        key={key!}
                        label={text}
                        onDeleteClick={() => topicClickAction(key!)}
                    />
                );
            })}
        </div>
    )
);
