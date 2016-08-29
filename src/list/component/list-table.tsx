import {autobind} from "core-decorators";
import {omit} from "lodash";
import * as React from "react";

import * as defaults from "../../defaults";
import {translate} from "../../translation";

import {ListBase, ListBaseProps} from "./list-base";
import {CLProps, OperationListItem} from "./memory-list";

const TABLE_CSS_CLASS = "mdl-data-table mdl-js-data-table mdl-shadow--2dp ";
const TABLE_CELL_CLASS = "mdl-data-table__cell--non-numeric";

export interface ListTablePropsBase<LineProps> extends ListBaseProps<LineProps> {
    columns: {sort?: "asc" | "desc", label: string, noSort: boolean}[];
    /** Default: 'id' */
    idField?: string;
    isEdit?: boolean;
    /** Default: false */
    isLoading?: boolean;
    loader?: () => React.ReactElement<any>;
    /** Default: [] */
    operationList?: OperationListItem[];
    reference?: any;
    /** Default: false */
    isSelectable?: boolean;
    sortColumn?: (index: number, order: "asc" | "desc") => void;
}

export type ListTableProps<LineProps extends CLProps<{}>> = ListTablePropsBase<LineProps> & LineProps;

@autobind
export class ListTable extends ListBase<ListTablePropsBase<CLProps<{}>>, {}> {

    private renderTableHeader() {
        const columns = this.props.columns.map((colProperties, id) => {
            let sort: React.ReactElement<any> | null;
            if (!this.props.isEdit && !colProperties.noSort) {
                const order = colProperties.sort ? colProperties.sort : "asc";
                const iconName = "asc" === order ? "arrow_drop_up" : "arrow_drop_down";
                const icon = <i className="material-icons">{iconName}</i>;
                sort = <a className="sort" data-bypass data-name={id} href="#" onClick={this.sortColumnAction(id, ("asc" === order ? "desc" : "asc" ))}>{icon}</a>;
            } else {
                sort = null;
            }
            return <th className={TABLE_CELL_CLASS} key={colProperties.label}>{translate(colProperties.label)}{sort}</th>;
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
        const {data, LineComponent, idField = "id", reference, operationList} = this.props;
        return (
            <tbody>
                {data && data.map((line, idx) => {
                    const otherLineProps = omit(this.props, "data", "operationList");
                    return (
                        <LineComponent
                            data={line}
                            key={line[idField] || idx}
                            reference={reference}
                            operationList={operationList || []}
                            {...otherLineProps}
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
                <tbody className={"table-loading"}>
                    <tr>
                        <td>{`${translate("list.loading")}`}</td>
                    </tr>
                </tbody>
            );
        } else {
            return null;
        }
    }

    private renderManualFetch() {
        const {isManualFetch, hasMoreData, columns} = this.props;
        const {Button} = defaults;
        if (!Button) {
            throw new Error("Button n'a pas été défini.");
        }
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
