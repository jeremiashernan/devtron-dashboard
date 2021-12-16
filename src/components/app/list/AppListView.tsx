import React, { Component } from 'react';
import { AppListViewType } from '../config';
import { ErrorScreenManager, Pagination, Progressing } from '../../common';
import { Link, RouteComponentProps } from 'react-router-dom';
import { ExpandedRow } from './expandedRow/ExpandedRow';
import { Empty } from './emptyView/Empty';
import { App, AppListState, OrderBy, SortBy } from './types';
import { AppCheckListModal } from '../../checkList/AppCheckModal';


interface AppListViewProps extends AppListState, RouteComponentProps<{}> {
    expandRow: (app: App | null) => void;
    closeExpandedRow: () => void;
    sort: (key: string) => void;
    redirectToAppDetails: (app, envId: number) => string;
    clearAll: () => void;
    changePage: (pageNo: number) => void;
    changePageSize: (size: number) => void;
}

export class AppListView extends Component<AppListViewProps>{

    renderEnvironmentList(app) {
        let len = app.environments.length;
        if (len) {
            return <div className="app-list__cell app-list__cell--env">
                <p className="app-list__cell--env-text">{app.defaultEnv ? app.defaultEnv.name : ""}</p>
                {len > 1 ? <button type="button" className="cell__link"
                    onClick={(event) => { event.stopPropagation(); event.preventDefault(); this.props.expandRow(app); }}>
                    +{len - 1} more </button> : null}
            </div>
        }
        else return <div className="app-list__cell app-list__cell--env"></div>
    }

    renderAppList() {
        if (this.props.apps.length) {
            let icon = this.props.sortRule.order == OrderBy.ASC ? "sort-up" : "sort-down";
            return <div className="app-list">
                <div className="app-list__header">
                    <div className="app-list__cell app-list__cell--name">
                        <button className="app-list__cell-header" onClick={e => { e.preventDefault(); this.props.sort('appNameSort') }}>App name
                            {this.props.sortRule.key == SortBy.APP_NAME ? <span className={icon}></span> : <span className="sort-col"></span>}
                        </button>
                    </div>
                    <div className="app-list__cell app-list__cell--env">
                        <span className="app-list__cell-header">Environment</span>
                    </div>
                    <div className="app-list__cell app-list__cell--cluster">
                        <span className="app-list__cell-header">Cluster</span>
                    </div>
                    <div className="app-list__cell app-list__cell--namespace">
                        <span className="app-list__cell-header">Namespace</span>
                    </div>
                    <div className="app-list__cell app-list__cell--time">
                        <span className="app-list__cell-header">Last Deployed Time </span>
                    </div>
                </div>
                {this.props.apps.map((app) => {
                    return <React.Fragment key={app.id} >
                        {!(this.props.appData && this.props.appData.id == app.id) ?
                            <Link to={this.props.redirectToAppDetails(app, app.defaultEnv.id)} className="app-list__row">
                                <div className="app-list__cell app-list__cell--name">
                                    <p className="truncate-text m-0">{app.name}</p>
                                </div>
                                {this.renderEnvironmentList(app)}
                                <div className="app-list__cell app-list__cell--cluster-name">
                                    <p className="truncate-text m-0"> {app.defaultEnv ? app.defaultEnv.clusterName : ""}</p>
                                </div>
                                <div className="app-list__cell app-list__cell--namespace">
                                    <p className="truncate-text m-0"> {app.defaultEnv ? app.defaultEnv.namespace : ""}</p>
                                </div>
                                <div className="app-list__cell app-list__cell--time">
                                    <p className="truncate-text m-0"> {app.defaultEnv ? app.defaultEnv.lastDeployedTime : ""}</p>
                                </div>
                            </Link>
                            : null}
                        {(this.props.appData && this.props.appData.id == app.id) ?
                            <ExpandedRow app={this.props.appData}
                                close={this.props.closeExpandedRow}
                                redirect={this.props.redirectToAppDetails} />
                            : null}
                    </React.Fragment>
                })}
            </div>
        }
    }

    renderPagination() {
        if (this.props.size > 20) {
            return <Pagination size={this.props.size}
                pageSize={this.props.pageSize}
                offset={this.props.offset}
                changePage={this.props.changePage}
                changePageSize={this.props.changePageSize} />
        }
    }


    render() {
        if (this.props.view === AppListViewType.LOADING) {
            return <React.Fragment>
                <div className="loading-wrapper">
                    <Progressing pageLoader />
                </div>
            </React.Fragment>
        }
        else if (this.props.view === AppListViewType.EMPTY) {
            return <React.Fragment>
                <AppCheckListModal history={this.props.history}
                    location={this.props.location}
                    match={this.props.match}
                    appChecklist={this.props.appChecklist}
                    chartChecklist={this.props.chartChecklist}
                    appStageCompleted={this.props.appStageCompleted}
                    chartStageCompleted={this.props.chartStageCompleted}
                />
            </React.Fragment>
        }
        else if (this.props.view === AppListViewType.NO_RESULT) {
            return <React.Fragment>
                <Empty view={this.props.view}
                    title={"No matching apps"}
                    message={"We couldn't find any matching applications."}
                    buttonLabel={"View All Apps"}
                    clickHandler={this.props.clearAll} />
            </React.Fragment>
        }
        else if (this.props.view === AppListViewType.ERROR) {
            return <React.Fragment>
                <div className="loading-wrapper">
                    <ErrorScreenManager code={this.props.code} />
                </div>
            </React.Fragment>
        }
        else {
            return <React.Fragment>
                {this.renderAppList()}
                {this.renderPagination()}
            </React.Fragment>
        }
    }
}