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
import DeployedChartFilters from './DeployedChartFilters';
import { showError } from '../../common';
import { getChartRepoList, getEnvironmentListMin } from '../../../services/service'
import emptyImage from '../../../assets/img/empty-noresult@2x.png';
import EmptyState from '../../EmptyState/EmptyState';

const QueryParams = {
    ChartRepoId: 'chartRepoId',
    EnvironmentId: 'envs',
    IncludeDeprecated: 'includeDeprecated',
    AppStoreName: 'appName',
}

const ChartQueryKey = {
    Environemnt: "environment",
    ChartRepo: "chart-repo"
}
class Deployed extends Component<DeployedChartProps, DeployedChartState> {

    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            installedCharts: [],
            chartRepos: [],
            environment: [],
            selectedChartRepo: [],
            selectedEnvironment: [],
            includeDeprecated: 0,
            appStoreName: "",
            searchApplied: false,
            appliedChartRepoFilter: [],
            appliedEnvironmentFilter: [],
            chartListloading: true
        }
    }

    async componentDidMount() {
        try {
            const [{ result: chartRepoList }, { result: environments }] = await Promise.all([getChartRepoList(), getEnvironmentListMin()])
            let chartRepos = chartRepoList.map((chartRepo) => {
                return {
                    value: chartRepo.id,
                    label: chartRepo.name
                }
            });
            let environment = environments.map((env) => {
                return {
                    value: env.id,
                    label: env.environment_name
                }
            });
            this.setState({ ...this.state, view: ViewType.LOADING, chartRepos: chartRepos, environment: environment });
        }
        catch (err) {
            showError(err)
            this.setState({ ...this.state, view: ViewType.LOADING })
        }
        finally {
            this.setState({ ...this.state, view: ViewType.LOADING })
        }

        this.initialiseFromQueryParams(this.state.chartRepos, this.state.environment);
        this.callApplyFilterOnCharts();
        this.getInstalledCharts(this.props.location.search);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.search !== this.props.location.search) {
            this.initialiseFromQueryParams(this.state.chartRepos, this.state.environment);
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


    renderPageHeader() {
        return <GenericChartsHeader>
            <HeaderTitle>Chart Store</HeaderTitle>
            <ChartDetailNavigator />
            <HeaderButtonGroup><span /></HeaderButtonGroup>
        </GenericChartsHeader>
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

    setAppStoreName = (event) => {
        this.setState({ appStoreName: event })
    }

    setSelectedFilters = (selected, key) => {
        if (key == ChartQueryKey.ChartRepo) {
            this.setState({ selectedChartRepo: selected })
        }
        if (key == ChartQueryKey.Environemnt) {
            this.setState({ selectedEnvironment: selected })
        }
    }

    setAppliedChartRepoFilter = (selected, key) => {
        if (key == ChartQueryKey.ChartRepo) { this.setState({ appliedChartRepoFilter: selected }) }
        if (key == ChartQueryKey.Environemnt) { this.setState({ appliedEnvironmentFilter: selected }) }

    }

    handleFilterChanges = (selected, key): void => {
        const searchParams = new URLSearchParams(this.props.location.search);
        const app = searchParams.get(QueryParams.AppStoreName);
        const deprecate = searchParams.get(QueryParams.IncludeDeprecated);
        const chartRepoId = searchParams.get(QueryParams.ChartRepoId);
        const envId = searchParams.get(QueryParams.EnvironmentId)

        let url = this.props.match.url

        if (key == "chart-repo") {
            let chartRepoId = selected?.map((e) => { return e.value }).join(",");
            let qs = `${QueryParams.ChartRepoId}=${chartRepoId}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (envId) qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`;
            this.props.history.push(`${url}?${qs}`)
        };

        if (key == "deprecated") {
            let qs = `${QueryParams.IncludeDeprecated}=${selected}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            if (envId) qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`;
            this.props.history.push(`${url}?${qs}`);
        }

        if (key == "search") {
            selected.preventDefault();
            let qs = `${QueryParams.AppStoreName}=${this.state.appStoreName}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            if (envId) qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`;
            this.props.history.push(`${url}?${qs}`);
        }

        if (key == "environment") {
            let environmentId = selected?.map((e) => { return e.value }).join(",");
            let qs = `${QueryParams.EnvironmentId}=${environmentId}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            this.props.history.push(`${url}?${qs}`);
        }

        if (key == "clear") {
            let qs: string = "";
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            if (envId) qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`;
            this.props.history.push(`${url}?${qs}`);
        }
    }

    handleViewAllCharts = () => {
        this.props.history.push(`${this.props.match.url}`);
    }

    handleCloseFilter = (key) => {
        if (key == ChartQueryKey.ChartRepo) {
            this.setState({
                selectedChartRepo: { ...this.state.appliedChartRepoFilter }
            })
        }
        if (key == ChartQueryKey.Environemnt) {
            this.setState({
                selectedChartRepo: { ...this.state.appliedEnvironmentFilter }
            })
        }
    }

    initialiseFromQueryParams = (chartRepoList, environmentList) => {
        let searchParams = new URLSearchParams(this.props.location.search);
        let allChartRepoIds: string = searchParams.get(QueryParams.ChartRepoId);
        let deprecated: string = searchParams.get(QueryParams.IncludeDeprecated);
        let appStoreName: string = searchParams.get(QueryParams.AppStoreName);
        let allenvironmentIds: string = searchParams.get(QueryParams.EnvironmentId);

        let chartRepoIdArray = [];
        if (allChartRepoIds) { chartRepoIdArray = allChartRepoIds.split(",") }
        chartRepoIdArray = chartRepoIdArray.map((chartRepoId => parseInt(chartRepoId)))
        let selectedRepos = [];
        for (let i = 0; i < chartRepoIdArray.length; i++) {
            let chartRepo = chartRepoList.find(item => item.value === chartRepoIdArray[i]);
            if (chartRepo) selectedRepos.push(chartRepo);
        }

        if (selectedRepos) { this.setState({ selectedChartRepo: selectedRepos }) };
        let environmentIdArray = []
        if (allenvironmentIds) { environmentIdArray = allenvironmentIds.split(",") }
        environmentIdArray = environmentIdArray.map((environmentId => parseInt(environmentId)))
        let selectedEnvironment = [];
        for (let i = 0; i < environmentIdArray.length; i++) {
            let environment = environmentList.find(item => item.value === environmentIdArray[i]);
            if (environment) selectedEnvironment.push(environment);
        }
        if (selectedEnvironment) { this.setState({ selectedEnvironment: selectedEnvironment }) }
        if (deprecated) { this.setState({ includeDeprecated: parseInt(deprecated) }) }
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
        if (selectedRepos) { this.setAppliedChartRepoFilter(selectedRepos, ChartQueryKey.ChartRepo) }
        if (selectedEnvironment) { this.setAppliedChartRepoFilter(selectedEnvironment, ChartQueryKey.Environemnt) }
    }

    async callApplyFilterOnCharts() {
        this.setState({ view: ViewType.LOADING })
        let response = await getInstalledCharts(this.props.location.search)
        this.setState({ view: ViewType.FORM, installedCharts: response.result })
    }

    render() {
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
                <DeployedChartFilters
                    handleFilterChanges={this.handleFilterChanges}
                    appStoreName={this.state.appStoreName}
                    searchApplied={this.state.searchApplied}
                    handleCloseFilter={this.handleCloseFilter}
                    includeDeprecated={this.state.includeDeprecated}
                    chartRepos={this.state.chartRepos}
                    setAppStoreName={this.setAppStoreName}
                    environment={this.state.environment}
                    setSelectedFilters={this.setSelectedFilters}
                    selectedChartRepo={this.state.selectedChartRepo}
                    selectedEnvironment={this.state.selectedEnvironment}
                />
                <span className='empty-height' style={{ height: "calc(100vh - 160px)" }}>
                    <EmptyState>
                        <EmptyState.Image><img src={emptyImage} alt="" /></EmptyState.Image>
                        <EmptyState.Title><h4>No  matching Charts</h4></EmptyState.Title>
                        <EmptyState.Subtitle>We couldn't find any matching results</EmptyState.Subtitle>
                        <button type="button" onClick={this.handleViewAllCharts} className="cta ghosted mb-24">View all charts</button>
                    </EmptyState>
                </span>
                {/* <div style={{ width: "600px", margin: "auto", marginTop: '20px' }} className="bcn-0 pt-20 pb-20 pl-20 pr-20 br-8 en-1 bw-1 mt-20">
                    <AllCheckModal />
                </div> */}
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
                    includeDeprecated={this.state.includeDeprecated}
                    chartRepos={this.state.chartRepos}
                    setAppStoreName={this.setAppStoreName}
                    environment={this.state.environment}
                    setSelectedFilters={this.setSelectedFilters}
                    selectedChartRepo={this.state.selectedChartRepo}
                    selectedEnvironment={this.state.selectedEnvironment}
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
