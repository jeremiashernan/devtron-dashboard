import React, { useState, useEffect, useRef } from 'react';
import { Progressing, useAsync, Select, mapByKey, showError, BreadCrumb, useBreadcrumb, ConditionalWrap, Checkbox } from '../../common';
import { Switch, Route, NavLink } from 'react-router-dom';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg';
import ChartSelect from '../util/ChartSelect';
import ChartGroupCard from '../util/ChartGroupCard';
import ChartValues from '../chartValues/ChartValues';
import ChartGroupList from '../list/ChartGroup';
import DiscoverChartDetails from '../discoverChartDetail/DiscoverChartDetails'
import MultiChartSummary from '../MultiChartSummary'
import AdvancedConfig from '../AdvancedConfig'
import { ChartDetailNavigator } from '../Charts'
import useChartGroup from '../useChartGroup'
import { getChartGroups, DeployableCharts, deployChartGroup } from '../charts.service'
import { ChartGroupEntry, Chart } from '../charts.types'
import { toast } from 'react-toastify';
import ChartGroupBasicDeploy from '../modal/ChartGroupBasicDeploy';
import CreateChartGroup from '../modal/CreateChartGroup'
import { URLS } from '../../../config';
import { Prompt } from 'react-router';
import { ReactComponent as WarningIcon } from '../../../assets/icons/ic-alert-triangle.svg';
import Tippy from '@tippyjs/react'
import ReactSelect from 'react-select';
import { getChartRepoList } from '../../../services/service'
import { DropdownIndicator, styles, ValueContainer, Option } from '../charts.util';
import EmptyImage from '../../../assets/img/empty-noresult@2x.png';
import EmptyState from '../../EmptyState/EmptyState';
import { Link } from 'react-router-dom';


//TODO: move to service
export function getDeployableChartsFromConfiguredCharts(charts: ChartGroupEntry[]): DeployableCharts[] {
    return charts.filter(chart => chart.isEnabled).map(chart => {
        return {
            appName: chart.name.value,
            environmentId: chart.environment.id,
            appStoreVersion: chart.appStoreApplicationVersionId,
            valuesOverrideYaml: chart.valuesYaml,
            referenceValueId: chart.appStoreValuesVersionId || chart.appStoreApplicationVersionId,
            referenceValueKind: chart.kind,
            chartGroupEntryId: chart.installedId,
        }
    })
}

function DiscoverListing() {
    const { push } = useHistory()
    const { url, path } = useRouteMatch()
    const [project, setProject] = useState({ id: null, error: "" })
    const [installing, setInstalling] = useState(false)
    const { breadcrumbs, setCrumb } = useBreadcrumb({})
    const {
        state,
        configureChart, selectChart, validateData, addChart, subtractChart, fetchChartValues, getChartVersionsAndValues, handleChartValueChange, handleChartVersionChange, handleValuesYaml, removeChart, handleEnvironmentChange, handleNameChange,
        handleEnvironmentChangeOfAllCharts, discardValuesYamlChanges,
        chartListing,
        applyFilterOnCharts,
    } = useChartGroup()
    const [chartGroupsLoading, result, error, reload] = useAsync(getChartGroups, [])
    const chartGroups = result?.result?.groups
    const projectsMap = mapByKey(state.projects, 'id')
    const [showDeployModal, toggleDeployModal] = useState(false);
    const isLeavingPageNotAllowed = useRef(false)

    isLeavingPageNotAllowed.current = !state.charts.reduce((acc: boolean, chart: ChartGroupEntry) => {
        return acc = acc && chart.originalValuesYaml === chart.valuesYaml;
    }, true);

    useEffect(() => {
        window.addEventListener('beforeunload', reloadCallback);
        return () => {
            window.removeEventListener('beforeunload', reloadCallback);
        }
    }, []);

    function reloadCallback(event) {
        event.preventDefault();
        if (isLeavingPageNotAllowed.current) {
            event.returnValue = "Your changes will be lost. Do you want to reload without deploying?"
        }
    }

    async function handleInstall() {
        if (!project.id) {
            setProject(project => ({ ...project, error: "Project is mandatory for deployment." }))
            return
        }
        try {
            setInstalling(true)
            const validated = await validateData()
            if (!validated) {
                toast.warn('Click on highlighted charts and resolve errors.', { autoClose: 5000 })
                return
            }
            const deployableCharts = getDeployableChartsFromConfiguredCharts(state.charts)
            await deployChartGroup(project.id, deployableCharts)
            let url = `${URLS.CHARTS}/deployed`;
            push(url);
            toast.success('Deployment initiated')
        }
        catch (err) {
            showError(err)
        }
        finally {
            setInstalling(false)
        }
    }

    function redirectToConfigure() {
        configureChart(0)
        toggleDeployModal(false)
    }

    function ChartGroupsList() {
        return <div className="chart-group">
            <div className="chart-group__header">
                <div className="flexbox">
                    <h2 className="chart-grid__title">Chart Groups</h2>
                    <button type="button" className="chart-group__view-all"
                        onClick={e => push(url + '/group')}>View All
                     </button>
                </div>
            </div>
            <div className="chart-grid chart-grid--chart-group-snapshot">
                {chartGroups?.slice(0, 4).map((chartGroup, idx) => <ChartGroupCard key={idx} chartGroup={chartGroup} />)}
            </div>
        </div>
    }

    return (
        <>
            <div className={`discover-charts ${state.charts.length > 0 ? 'summary-show' : ''}`}>
                <div className={`page-header ${state.charts.length === 0 ? 'page-header--tabs' : ''}`}>
                    <ConditionalWrap
                        condition={state.charts.length > 0}
                        wrap={children => <div className="flex left column">{children}</div>}
                    >
                        <>
                            {state.charts.length > 0 && (
                                <div className="flex left">
                                    <BreadCrumb breadcrumbs={breadcrumbs.slice(1)} />
                                </div>
                            )}
                            <div className="page-header__title flex left">
                                {state.charts.length === 0 ? 'Chart Store' : 'Deploy multiple charts'}
                            </div>
                            {state.charts.length === 0 && <ChartDetailNavigator />}
                        </>
                    </ConditionalWrap>
                    <div className="page-header__cta-container flex">
                        {state.charts.length === 0 && (
                            <NavLink className="cta no-decor flex" to={`${url}/create`}>
                                <Add className="icon-dim-18 mr-5" />
                                Create Group
                            </NavLink>
                        )}
                    </div>
                </div>
                <Prompt
                    when={isLeavingPageNotAllowed.current}
                    message={'Your changes will be lost. Do you want to leave without deploying?'}
                />
                {state.loading || chartGroupsLoading ? (
                    <Progressing pageLoader />
                ) : (
                        <div className="discover-charts__body">
                            <div className="discover-charts__body-details">
                                {typeof state.configureChartIndex === 'number' ? (
                                    <AdvancedConfig
                                        chart={state.charts[state.configureChartIndex]}
                                        index={state.configureChartIndex}
                                        handleValuesYaml={handleValuesYaml}
                                        getChartVersionsAndValues={getChartVersionsAndValues}
                                        fetchChartValues={fetchChartValues}
                                        handleChartValueChange={handleChartValueChange}
                                        handleChartVersionChange={handleChartVersionChange}
                                        handleEnvironmentChange={handleEnvironmentChange}
                                        handleNameChange={handleNameChange}
                                        discardValuesYamlChanges={discardValuesYamlChanges}
                                    />
                                ) : (
                                        <>
                                            {Array.isArray(chartGroups) && chartGroups.length > 0 && <ChartGroupsList />}
                                            <ChartList availableCharts={state.availableCharts}
                                                charts={state.charts}
                                                selectedInstances={state.selectedInstances}
                                                showDeployModal={showDeployModal}
                                                addChart={addChart}
                                                subtractChart={subtractChart}
                                                selectChart={selectChart}
                                                applyFilterOnCharts={applyFilterOnCharts}
                                            />
                                        </>
                                    )}
                            </div>
                            <aside className={`summary`}>
                                <MultiChartSummary
                                    charts={state.charts}
                                    configureChartIndex={state.configureChartIndex}
                                    configureChart={configureChart}
                                    chartListing={chartListing}
                                    getChartVersionsAndValues={getChartVersionsAndValues}
                                    handleChartValueChange={
                                        typeof state.configureChartIndex === 'number' ? null : handleChartValueChange
                                    }
                                    handleChartVersionChange={
                                        typeof state.configureChartIndex === 'number' ? null : handleChartVersionChange
                                    }
                                    removeChart={removeChart}
                                />
                                <div
                                    className={`flex left deployment-buttons ${state.advanceVisited ? 'deployment-buttons--advanced' : ''
                                        }`}
                                >
                                    {state.advanceVisited && (
                                        <div>
                                            <label>Project*</label>
                                            <Select
                                                rootClassName={`${project.error ? 'popup-button--error' : ''}`}
                                                value={project.id}
                                                onChange={(e) => setProject({ id: e.target.value, error: '' })}
                                            >
                                                <Select.Button>
                                                    {project.id && projectsMap.has(project.id)
                                                        ? projectsMap.get(project.id).name
                                                        : 'Select project'}
                                                </Select.Button>
                                                {state.projects?.map((project) => (
                                                    <Select.Option key={project.id} value={project.id}>
                                                        {project.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                            {project.error && (
                                                <span className="form__error flex left ">
                                                    <WarningIcon className="mr-5" />
                                                    {project.error}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {!state.advanceVisited && (
                                        <ConditionalWrap
                                            condition={state.charts.length === 0}
                                            wrap={(children) => (
                                                <Tippy
                                                    className="default-tt"
                                                    arrow={false}
                                                    placement="top"
                                                    content="Add charts to deploy"
                                                >
                                                    <div>{children}</div>
                                                </Tippy>
                                            )}
                                        >
                                            <button
                                                type="button"
                                                disabled={state.charts.length === 0}
                                                onClick={(e) => configureChart(0)}
                                                className="cta cancel ellipsis-right"
                                            >
                                                Advanced Options
                                        </button>
                                        </ConditionalWrap>
                                    )}
                                    <ConditionalWrap
                                        condition={state.charts.length === 0}
                                        wrap={(children) => (
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="top"
                                                content="Add charts to deploy"
                                            >
                                                <div>{children}</div>
                                            </Tippy>
                                        )}
                                    >
                                        <button
                                            disabled={state.charts.length === 0}
                                            type="button"
                                            onClick={state.advanceVisited ? handleInstall : () => toggleDeployModal(true)}
                                            className="cta ellipsis-right"
                                        >
                                            {installing ? (
                                                <Progressing />
                                            ) : state.advanceVisited ? (
                                                'Deploy charts'
                                            ) : (
                                                        'Deploy to...'
                                                    )}
                                        </button>
                                    </ConditionalWrap>
                                </div>
                            </aside>
                        </div>
                    )}
            </div>
            {showDeployModal ? (
                <ChartGroupBasicDeploy
                    projects={state.projects}
                    chartGroupEntries={state.charts}
                    environments={state.environments}
                    selectedProjectId={project.id}
                    loading={installing}
                    deployChartGroup={handleInstall}
                    handleProjectChange={(projectId) => setProject({ id: projectId, error: '' })}
                    handleNameChange={handleNameChange}
                    closeDeployModal={() => toggleDeployModal(false)}
                    handleEnvironmentChangeOfAllCharts={handleEnvironmentChangeOfAllCharts}
                    redirectToAdvancedOptions={redirectToConfigure}
                    validateData={validateData}
                />
            ) : null}
        </>
    );
}

function ChartList({ availableCharts, selectedInstances, charts, addChart, subtractChart, selectChart, applyFilterOnCharts, showDeployModal }) {
    const chartList: Chart[] = Array.from(availableCharts.values());
    const history = useHistory();
    const location = useLocation();
    const { url } = useRouteMatch();
    const [chartRepoList, setChartRepoList] = useState([]);
    const [selectedChartRepo, setSelectedChartRepo] = useState();
    const [appStoreName, setAppStoreName] = useState("");
    const [deprecate, setDeprecate] = useState(true);
    const [loading, result, error] = useAsync(getChartRepoList)

    useEffect(() => {
        function chartRepo(list) {
            return {
                value: list.id,
                label: list.name
            }
        }
        getChartRepoList().then((res) => {
            let list = res.result
            list = list.map(chartRepo)
            setChartRepoList(list);
        })
    }, [])

    useEffect(() => {
        applyFilterOnCharts(location.search);
    }, [location.search])

    useEffect(() => {
        function handleChartRepoChange(selected): void {
            let chartRepoId = selected?.map((e) => { return e.value }).join(",");
            let searchParams = new URLSearchParams(location.search);
            let app = searchParams.get('appStoreName');
            let deprecate = searchParams.get('deprecated');
            let qs = `chartRepoId=${chartRepoId}`;
            if (app) qs = `${qs}&appStoreName=${app}`;
            if (deprecate) qs = `${qs}&deprecated=${deprecate}`;
            history.push(`${url}?${qs}`);
        }

        handleChartRepoChange(selectedChartRepo);
    }, [selectedChartRepo])

    useEffect(() => {
        function handleDeprecate(e): void {
            let searchParams = new URLSearchParams(location.search);
            let app = searchParams.get('appStoreName');
            let chartRepoId = searchParams.get('chartRepoId');
            let qs = `deprecated=${deprecate}`;
            if (app) qs = `${qs}&appStoreName=${app}`;
            if (chartRepoId) qs = `${qs}&chartRepoId=${chartRepoId}`
            history.push(`${url}?${qs}`);
        }
        console.log(deprecate)
        handleDeprecate(deprecate);
    }, [deprecate])


    function handleSearchChange(e): void {
        e.preventDefault();
        let searchParams = new URLSearchParams(location.search);
        let deprecate = searchParams.get('deprecated');
        let chartRepoId = searchParams.get('chartRepoId');
        let qs = `appStoreName=${appStoreName}`;
        if (deprecate) qs = `${qs}&deprecated=${deprecate}`;
        if (chartRepoId) qs = `${qs}&chartRepoId=${chartRepoId}`;
        history.push(`${url}?${qs}`);
    }
    
        function renderEmptyState(){
            return  <div className="w-100 flex column" style={{ height: '100%' }}>
                        <EmptyImage />
                        <div className="fs-16 fw-6 cn-9">No  matching Charts</div>
                        <p className="fs-12 cn-7" style={{width:'250px', textAlign:'center'}}>We couldn't find any matching results</p>
                    </div>
        }

        if (loading ) return <Progressing  pageLoader/>
        else if(appStoreName && deprecate == !chartRepoList){
            return <div style={{ "height": "calc(100vh - 215px)" }}>
            {renderEmptyState()}
        </div>
        }
        console.log(selectedChartRepo)
   

    return (
        <>
            <div className="chart-group__header">
                <h3 className="chart-grid__title">{charts.length === 0 ? 'All Charts' : 'Select Charts'}</h3>
                <h5 className="form__subtitle">Select chart to deploy. &nbsp;</h5>
                <div className="flexbox flex-justify">
                    <form onSubmit={handleSearchChange} className="search search--container" >
                        <span className="search__icon"><i className="fa fa-search" aria-hidden="true"></i></span>
                        <input type="text" placeholder="Search charts" value={appStoreName} className="search__input__chart mr-10 mb-10" onChange={(event) => setAppStoreName(event.target.value)} />
                    </form>
                    <div className="flex">
                        <ReactSelect className="date-align-left"
                            placeholder="All repositories"
                            name="All repositories"
                            value={selectedChartRepo}
                            options={chartRepoList}
                            isClearable={false}
                            onChange={(selected: any) => setSelectedChartRepo(selected)}
                            isMulti={true}
                            hideSelectedOptions={false}
                            components={{
                                DropdownIndicator,
                                ValueContainer,
                                Option: Option,
                                IndicatorSeparator: null,
                            }}
                            styles={{
                                container: (base, state) => ({
                                    ...base,
                                    width: '230px',
                                }),
                                control: (base, state) => ({
                                    ...base,
                                    height: '36px',
                                    minHeight: 'unset',
                                    width: '230px',
                                    border: state.isFocused ? '1px solid #0066CC' : '1px solid #d6dbdf',
                                    boxShadow: 'none',
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                    color: 'var(--N900)',
                                    fontSize: '12px',
                                    padding: '8px 24px',
                                }),
                            }} />
                        <Checkbox rootClassName="ml-16 mb-0 fs-14 cursor bcn-0 pt-8 pb-8 pl-12 pr-12 date-align-left--deprecate"
                            isChecked={deprecate} value={"CHECKED"}
                            onChange={(event) => setDeprecate(!deprecate)} >
                            Show deprecated
                    </Checkbox>
                    </div>
                </div>
            </div>

            <div className="chart-grid">
                {chartList.slice(0, showDeployModal ? 12 : chartList.length).map(chart => <ChartSelect
                    key={chart.id}
                    chart={chart}
                    selectedCount={selectedInstances[chart.id]?.length}
                    showCheckBoxOnHoverOnly={charts.length === 0}
                    addChart={addChart}
                    subtractChart={subtractChart}
                    onClick={(chartId) => charts.length === 0 ? history.push(`${url}/chart/${chart.id}`) : selectChart(chartId)}
                />
                )}
            </div>
        </>
    )
}

export default function DiscoverChartsRouter() {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()
    const { url, path } = match

    return <>
        <Switch>
            <Route path={`${path}/group`}>
                <ChartGroupList />
            </Route>
            <Route path={`${path}/chart/:chartId/chart-value/:chartValueId?`} render={(props) => {
                return <ChartValues location={props.location} match={props.match} history={props.history} />
            }} />
            <Route path={`${path}/chart/:chartId`} component={DiscoverChartDetails} />
            <Route>
                <DiscoverListing />
                <Route exact path={`${path}/create`}>
                    <CreateChartGroup
                        history={history}
                        location={location}
                        match={match}
                        closeChartGroupModal={() => history.push(url)}
                    />
                </Route>
            </Route>
        </Switch>
    </>
}