import React from 'react'
import { NavLink } from 'react-router-dom';
import { URLS, Routes} from '../../../config';
import { BreadCrumb, useBreadcrumb } from '../../common';
import ReactGA from 'react-ga';
import AppSelector from '../../AppSelector';
import { useParams, useRouteMatch, useHistory, generatePath } from 'react-router'
import { get} from '../../../services/api';
import { handleUTCTime} from '../../common';
import  './header.css'
import IndexStore from '../appDetails/index.store';

function ChartHeaderComponent() {
    const match = useRouteMatch();
    const history = useHistory();
    const params = useParams<{ appId: string, envId: string, appName: string }>()
    const { path } = useRouteMatch();
    const appDetails = IndexStore.getAppDetails()

    function handleBreadcrumbChartChange(selected) {
        const newUrl = generatePath(path, { appId: selected.installedAppId, envId: selected.environmentId });
        history.push(newUrl)
    }


 function getInstalledCharts(queryString: string) {
    let url = `${Routes.CHART_INSTALLED}`
    if (queryString) {
        url = `${url}${queryString}`
    }
    return get(url).then(response => {
        return {
            ...response,
            result: Array.isArray(response.result) ? response.result.map((chart) => {
                return {
                    ...chart,
                    deployedAt: chart.deployedAt ? handleUTCTime(chart.deployedAt, true) : '',
                }
            }) : []
        }
    })
}

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':appId(\\d+)': {
                    component: (
                        <AppSelector
                         //@ts-ignore
                            api={getInstalledCharts}
                            primaryKey="appId"
                            primaryValue="appName"
                            matchedKeys={['envId']}
                            apiPrimaryKey="installedAppId"
                            onChange={handleBreadcrumbChartChange}
                        />
                    ),
                    linked: false,
                },
                'chart-store': null,
                deployments: 'Deployed',
            },
        },
        [params.appId, params.envId],
    );

    return (
        <div className="app-page-header" style={{ gridTemplateColumns: "unset" }}>
            <div className="m-0 flex left ">
                <span className='cb-5 fs-16'>Helm Apps </span>
                <span className='fs-16 cn-9 ml-4 mr-4'> / </span>
                <span className='fs-16 cn-9'>{appDetails.appName}</span>

                {/* <BreadCrumb breadcrumbs={breadcrumbs.slice(0, breadcrumbs.length - 2)} /> */}
            </div>

            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab ellipsis-right fs-13">
                    <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_DETAILS}`} className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'App Details Clicked',
                            });
                        }}>App Details
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_VALUES}`} className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Trigger Clicked',
                            });
                        }}>Values
                    </NavLink>
                </li>
            </ul>
        </div>
    )
}

export default ChartHeaderComponent
