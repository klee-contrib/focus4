import {autobind} from "core-decorators";
import i18n = require("i18next");
import * as React from "react";

import Button from "focus-components/button";

import {LineProps} from "./lines";
import {ListBase, ListBaseProps, WithData} from "./list-base";

export interface ListTimelineProps<T, P extends LineProps<T>> extends ListBaseProps<T, P> {
    /** Par défaut: "id" */
    idField?: string;
    isLoading?: boolean;
    loader?: () => React.ReactElement<any>;
}

@autobind
export class ListTimeline<T, P extends LineProps<T>> extends ListBase<T, WithData<ListTimelineProps<T, P>, T>> {

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
            return <li className="timeline-loading">{i18n.t("list.loading")}</li>;
        } else {
            return null;
        }
    }

    renderManualFetch() {
        const {isManualFetch, hasMoreData} = this.props;
        if (isManualFetch && hasMoreData) {
            return (
                <li className="timeline-button">
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
            <ul className="timeline">
                {this.renderLines()}
                {this.renderLoading()}
                {this.renderManualFetch()}
            </ul>
        );
    }
}
