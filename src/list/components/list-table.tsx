import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";

import {LineProps} from "./lines";
import {ListBase, ListBaseProps, WithData} from "./list-base";

const TABLE_CSS_CLASS = "mdl-data-table mdl-js-data-table mdl-shadow--2dp ";
const TABLE_CELL_CLASS = "mdl-data-table__cell--non-numeric";

export interface ListTableProps<T, P extends LineProps<T>> extends ListBaseProps<T, P> {
    columns: {sort?: "asc" | "desc", label: string, noSort: boolean}[];
    /** Par défaut: "id" */
    idField?: string;
    isLoading?: boolean;
    loader?: () => React.ReactElement<any>;
    isSelectable?: boolean;
    sortColumn?: (index: number, order: "asc" | "desc") => void;
}

@autobind
@observer
export class ListTable<T, P extends LineProps<T>> extends ListBase<T, WithData<ListTableProps<T, P>, T>> {

    /** Instancie une version typée du ListTable. */
    static create<T, L extends LineProps<T>>(props: WithData<ListTableProps<T, L>, T>) {
        const List = ListTable as any;
        return <List {...props} />;
    }

    private renderTableHeader() {
        const columns = this.props.columns.map((colProperties, id) => {
            let sort: React.ReactElement<any> | null;
            if (!colProperties.noSort) {
                const order = colProperties.sort ? colProperties.sort : "asc";
                const iconName = "asc" === order ? "arrow_drop_up" : "arrow_drop_down";
                const icon = <i className="material-icons">{iconName}</i>;
                sort = <a className="sort" data-bypass data-name={id} href="#" onClick={this.sortColumnAction(id, ("asc" === order ? "desc" : "asc" ))}>{icon}</a>;
            } else {
                sort = null;
            }
            return <th className={TABLE_CELL_CLASS} key={colProperties.label}>{i18n.t(colProperties.label)}{sort}</th>;
        });
        return <thead><tr>{columns}</tr></thead>;
    }

    private sortColumnAction(index: number, order: "asc" | "desc") {
        return (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            if (this.props.sortColumn) {
                this.props.sortColumn(index, order);
            }
        };
    }

    private renderTableBody() {
        const {data, LineComponent, idField = "id", lineProps} = this.props;
        return (
            <tbody>
                {data.map((item, idx) => {
                    const idValue = (item as any)[idField];
                    return (
                        <LineComponent
                            data={item}
                            key={(idValue && (idValue.$entity ? idValue.value : idValue)) || idx}
                            {...lineProps}
                        />
                    );
                })}
            </tbody>
        );
    }

    private renderLoading() {
        const {isLoading, loader} = this.props;
        if (isLoading) {
            if (loader) {
                return loader();
            }
            return (
                <tbody className="table-loading">
                    <tr>
                        <td>{`${i18n.t("list.loading")}`}</td>
                    </tr>
                </tbody>
            );
        } else {
            return null;
        }
    }

    private renderManualFetch() {
        const {isManualFetch, hasMoreData, columns} = this.props;
        if (isManualFetch && hasMoreData) {
            return (
                <tfoot className="table-manual-fetch">
                    <tr>
                        <td colSpan={columns.length}>
                            <Button handleOnClick={() => this.handleShowMore()} label="list.button.showMore" type="button" />
                        </td>
                    </tr>
                </tfoot>
            );
        } else {
            return null;
        }
    }

    render() {
        const SELECTABLE_CSS = this.props.isSelectable ? "mdl-data-table--selectable" : "";
        return (
            <table className={`${TABLE_CSS_CLASS} ${SELECTABLE_CSS}`}>
                {this.renderTableHeader()}
                {this.renderTableBody()}
                {this.renderLoading()}
                {this.renderManualFetch()}
            </table>
        );
    }
}
