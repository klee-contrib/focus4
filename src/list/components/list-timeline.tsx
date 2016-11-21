import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";

import {injectStyle} from "../../theming";

import {LineProps} from "./lines";
import {ListBase, ListBaseProps, WithData} from "./list-base";

import * as styles from "./style/list-timeline.css";
export type ListTimelineStyle = Partial<typeof styles>;

export interface ListTimelineProps<T, P extends LineProps<T>> extends ListBaseProps<T, P> {
    classNames?: ListTimelineStyle;
    /** Par défaut: "id" */
    idField?: string;
    isLoading?: boolean;
    loader?: () => React.ReactElement<any>;
}

@injectStyle("listTimeline")
@autobind
@observer
export class ListTimeline<T, P extends LineProps<T>> extends ListBase<T, WithData<ListTimelineProps<T, P>, T>> {

    /** Instancie une version typée du ListTimeline. */
    static create<T, L extends LineProps<T>>(props: WithData<ListTimelineProps<T, L>, T>) {
        const List = injectStyle("listTimeline", ListTimeline) as any;
        return <List {...props} />;
    }

    renderLines() {
        const {LineComponent, data, idField = "id", lineProps} = this.props;
        return data.map((line, idx) => {
            const idValue = (line as any)[idField];
            return (
                <LineComponent
                    data={line}
                    key={(idValue && (idValue.$entity ? idValue.value : idValue)) || idx}
                    {...lineProps}
                />
            );
        });
    }

    renderLoading() {
        const {loader, isLoading} = this.props;
        if (isLoading) {
            if (loader) {
                return loader();
            }
            return <li>{i18n.t("list.loading")}</li>;
        } else {
            return null;
        }
    }

    renderManualFetch() {
        const {isManualFetch, hasMoreData} = this.props;
        if (isManualFetch && hasMoreData) {
            return (
                <li>
                    <Button
                        label="list.button.showMore"
                        type="button"
                        handleOnClick={this.handleShowMore}
                    />
                </li>
            );
        } else {
            return null;
        }
    }

    render() {
        return (
            <ul className={`${styles.list} ${this.props.classNames!.list || ""}`}>
                {this.renderLines()}
                {this.renderLoading()}
                {this.renderManualFetch()}
            </ul>
        );
    }
}
