import React, { Component } from 'react';
import { DeployedChartProps, DeployedChartState } from '../charts.types';
import { ViewType } from '../../../config';
import { Link, withRouter } from 'react-router-dom';
import { ErrorScreenManager, LazyImage, Progressing, multiSelectStyles, Checkbox, Option } from '../../common';
import { UpdateWarn } from '../../common/DeprecatedUpdateWarn';
import { getInstalledCharts } from '../charts.service';
import { toast } from 'react-toastify'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import { HeaderTitle, HeaderButtonGroup, GenericChartsHeader, ChartDetailNavigator } from '../Charts'
import { ChartCheckListModal } from '../../checkList/ChartCheckModal';
import { AllCheckModal } from '../../checkList/AllCheckModal';
import { DropdownIndicator, ValueContainer } from '../charts.util';
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg';
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg';
import ReactSelect, { components } from 'react-select';
import DeployedChartFilters from './DeployedChartFilters';

const QueryParams = {
    ChartRepoId: 'chartRepoId',
    IncludeDeprecated: 'includeDeprecated',
    AppStoreName: 'appStoreName',
}

class Deployed extends Component<DeployedChartProps, DeployedChartState> {

    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            loading: false,
            view: ViewType.LOADING,
            installedCharts: [],
            includeDeprecated: 0,
            appStoreName: "",
            searchApplied: false,
            selectedChartRepo: [],
            appliedChartRepoFilter: [],
            chartListloading: true
        }
    }

    componentDidMount() {
        if (!this.props.location.search) {
            this.props.history.push(`${this.props.match.url}?${QueryParams.IncludeDeprecated}=0`);
        }
        else {
            this.initialiseFromQueryParams(this.state.installedCharts);
            { console.log(this.state.installedCharts) }
            this.callApplyFilterOnCharts();
            this.getInstalledCharts(this.props.location.search);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.search !== this.props.location.search) {
            this.initialiseFromQueryParams(this.state.installedCharts);
            this.callApplyFilterOnCharts();

        }
    }

    getInstalledCharts(qs) {
        getInstalledCharts(qs).then((response) => {
            this.setState({ installedCharts: response.result, view: ViewType.FORM });
        }).catch((errors) => {
            this.setState({ code: errors.code, view: ViewType.ERROR })
            if (errors && Array.isArray(errors.error)) {
                errors.errors.map(err => toast.error(err, { autoClose: false }))
            }
        })
    }

    handleImageError(e) {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

    renderCard(chart) {
        let { icon, chartName, appName, appStoreApplicationName, environmentName, deployedAt, installedAppId, environmentId, deprecated } = chart;
        return <Link key={appName} className="chart-grid-item white-card chart-grid-item--deployed" to={`deployments/${installedAppId}/env/${environmentId}`}>
            <div className="chart-grid-item__flexbox">
                <div className="chart-grid-item__icon-wrapper">
                    <LazyImage className="chart-grid-item__icon" src={icon} onError={this.handleImageError} />
                </div>
                {
                    deprecated &&
                    <div>
                        <UpdateWarn />
                        {/* <div className="chart-grid-item__top-right"><img src={check} className="chart-grid-item__top-right-icon" />Deployed</div> */}
                    </div>
                }
            </div>
            <div className="chart-grid-item__title ellipsis-right">{appName}</div>
            <div className="chart-grid-item__light-text ellipsis-right">{chartName}/{appStoreApplicationName}</div>
            <div className="chart-grid-item__env"><span className="env-badge">ENV</span>{environmentName}</div>
            <div className="chart-grid-item__light-text ellipsis-right">{deployedAt}</div>
        </Link>
    }

    renderPageHeader() {
        return <GenericChartsHeader>
            <HeaderTitle>Chart Store</HeaderTitle>
            <ChartDetailNavigator />
            <HeaderButtonGroup><span /></HeaderButtonGroup>
        </GenericChartsHeader>
    }

    handleFilterChanges = (selected, key): void => {
        const searchParams = new URLSearchParams(this.props.location.search);
        const app = searchParams.get(QueryParams.AppStoreName);
        const deprecate = searchParams.get(QueryParams.IncludeDeprecated);
        const chartRepoId = searchParams.get(QueryParams.ChartRepoId);

        let url = this.props.match.url

        if (key == "chart-repo") {
            let chartRepoId = selected?.map((e) => { return e.value }).join(",");
            let qs = `${QueryParams.ChartRepoId}=${chartRepoId}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            this.props.history.push(`${url}?${qs}`)
        };

        if (key == "deprecated") {
            let qs = `${QueryParams.IncludeDeprecated}=${selected}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            this.props.history.push(`${url}?${qs}`);
        }

        if (key == "search") {
            selected.preventDefault();
            let qs = `${QueryParams.AppStoreName}=${this.state.appStoreName}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            this.props.history.push(`${url}?${qs}`);
        }

        if (key == "clear") {
            let qs: string = "";
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            this.props.history.push(`${url}?${qs}`);
        }
    }

    handleViewAllCharts = () => {
        this.props.history.push(`${this.props.match.url}?${QueryParams.IncludeDeprecated}=1`);
    }

    handleCloseFilter = () => {
        this.setState({ selectedChartRepo: this.state.appliedChartRepoFilter })
    }

    initialiseFromQueryParams = (chartRepoList) => {
        { console.log(chartRepoList) }
        let searchParams = new URLSearchParams(this.props.location.pathname);
        let allChartRepoIds: string = searchParams.get(QueryParams.ChartRepoId);
        let deprecated: string = searchParams.get(QueryParams.IncludeDeprecated);
        let appStoreName: string = searchParams.get(QueryParams.AppStoreName);
        let chartRepoIdArray = [];
        if (allChartRepoIds) chartRepoIdArray = allChartRepoIds.split(",");
        chartRepoIdArray = chartRepoIdArray.map((chartRepoId => parseInt(chartRepoId)))
        let selectedRepos = [];
        for (let i = 0; i < chartRepoIdArray.length; i++) {
            let chartRepo = chartRepoList.find(item => item.value === chartRepoIdArray[i]);
            if (chartRepo) selectedRepos.push(chartRepo);
        }
        if (selectedRepos) {
            this.setState({
                selectedChartRepo: selectedRepos
            })
        };
        if (deprecated) this.setState({ includeDeprecated: parseInt(deprecated) })
        if (appStoreName) {
            this.setState({
                searchApplied: true,
                appStoreName: appStoreName
            });
        }
        else {
            this.setState({
                searchApplied: false,
                appStoreName: ""
            })
        }
        if (selectedRepos) this.setState({ appliedChartRepoFilter: selectedRepos })
    }

    async callApplyFilterOnCharts() {
        await getInstalledCharts(this.props.location.search)
    }

    render() {
        { console.log(this.state) }
        { console.log(this.state.installedCharts) }

        if (this.state.view === ViewType.LOADING) {
            return <div className="chart-list-page ">
                {this.renderPageHeader()}
                <div style={{ height: '100vh', width: '100vw' }}>
                    <Progressing pageLoader />
                </div>
            </div>
        }
        else if (this.state.view === ViewType.ERROR) {
            return <div className="chart-list-page">
                {this.renderPageHeader()}
                <ErrorScreenManager code={this.state.code} />
            </div>
        }
        if (this.state.installedCharts.length === 0) {
            return <div className="chart-list-page" >
                {this.renderPageHeader()}
                <div style={{ width: "600px", margin: "auto", marginTop: '20px' }} className="bcn-0 pt-20 pb-20 pl-20 pr-20 br-8 en-1 bw-1 mt-20">
                    <AllCheckModal />
                </div>
            </div>
        }
        else {
            return <div className="chart-list-page">
                {this.renderPageHeader()}
                <DeployedChartFilters
                    handleFilterChanges={this.handleFilterChanges}
                    appStoreName={this.state.appStoreName}
                    searchApplied={this.state.searchApplied}
                    handleCloseFilter={this.handleCloseFilter}
                    installedCharts={this.state.installedCharts}
                    selectedChartRepo={this.state.selectedChartRepo}
                    includeDeprecated={this.state.includeDeprecated}
                />
                <div className="chart-grid">
                    {this.state.installedCharts.map((chart) => {
                        return this.renderCard(chart);
                    })}
                </div>
            </div>
        }
    }
}
export default withRouter(props => <Deployed {...props} />)
