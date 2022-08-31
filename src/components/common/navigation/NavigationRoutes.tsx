import React, { lazy, Suspense, useEffect, useState, createContext, useContext, useCallback } from 'react'
import { Route, Switch } from 'react-router-dom'
import { URLS, AppListConstants, ViewType, SERVER_MODE } from '../../../config'
import { ErrorBoundary, Progressing, getLoginInfo, AppContext } from '../../common'
import Navigation from './Navigation'
import { useRouteMatch, useHistory, useLocation } from 'react-router'
import * as Sentry from '@sentry/browser'
import ReactGA from 'react-ga'
import { Security } from '../../security/Security'
import {
    dashboardLoggedIn,
    getAppListMin,
    getLoginData,
    getUserRole,
    getVersionConfig,
} from '../../../services/service'
import Reload from '../../Reload/Reload'
import { EnvType } from '../../v2/appDetails/appDetails.type'
import DevtronStackManager from '../../v2/devtronStackManager/DevtronStackManager'
import { ServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.type'
import { getServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import ClusterNodeContainer from '../../ClusterNodes/ClusterNodeContainer'
import DeployManageGuide from '../../onboardingGuide/DeployManageGuide'
import { showError } from '../helpers/Helpers'
import { AppRouterType } from '../guidePage/onboarding.type'

const Charts = lazy(() => import('../../charts/Charts'))
const ExternalApps = lazy(() => import('../../external-apps/ExternalApps'))
const AppDetailsPage = lazy(() => import('../../app/details/main'))
const NewAppList = lazy(() => import('../../app/list-new/AppList'))
const V2Details = lazy(() => import('../../v2/index'))
const GlobalConfig = lazy(() => import('../../globalConfigurations/GlobalConfiguration'))
const BulkActions = lazy(() => import('../../deploymentGroups/BulkActions'))
const BulkEdit = lazy(() => import('../../bulkEdits/BulkEdits'))
const OnboardingGuide = lazy(() => import('../../onboardingGuide/OnboardingGuide'))

export const mainContext = createContext(null)

export default function NavigationRoutes() {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()
    const [serverMode, setServerMode] = useState(undefined)
    const [pageState, setPageState] = useState(ViewType.LOADING)
    const [pageOverflowEnabled, setPageOverflowEnabled] = useState<boolean>(true)
    const [currentServerInfo, setCurrentServerInfo] = useState<{ serverInfo: ServerInfo; fetchingServerInfo: boolean }>(
        {
            serverInfo: undefined,
            fetchingServerInfo: false,
        },
    )
    const [isHelpGettingStartedClicked, setIsHelpGettingStartedClicked] = useState(false)
    const [loginCount, setLoginCount] = useState(0)
    const [expiryDate, setExpiryDate] = useState(0)
    const [isSuperAdmin, setSuperAdmin] = useState(false)
    const [appListCount, setAppListCount] = useState(0)
    const [loginLoader, setLoginLoader] = useState(true)
    const [isDeployManageCardClicked, setIsDeployManageCardClicked] = useState(false)

    const showCloseButtonAfterGettingStartedClicked = () => {
        setIsHelpGettingStartedClicked(true)
    }

    const getInit = () => {
        Promise.all([getUserRole(), getAppListMin()]).then((response) => {
                setSuperAdmin( response[0].result.roles.indexOf("role:super-admin___") > -1)
                setAppListCount(response[1].result.length)
                setLoginLoader(false)

            },
            (err) => {
                setLoginLoader(false)
                showError(err)
            },
        )
    }

    useEffect(() => {
        getInit()
        const expDate = localStorage.getItem('clickedOkay')
        setExpiryDate(+expDate)
    }, [])

    useEffect(() => {
        const loginInfo = getLoginInfo()
        if (process.env.NODE_ENV === 'production' && window._env_) {
            if (window._env_.SENTRY_ERROR_ENABLED) {
                Sentry.configureScope(function (scope) {
                    scope.setUser({ email: loginInfo['email'] || loginInfo['sub'] })
                })
            }
            if (window._env_.GA_ENABLED) {
                let email = loginInfo ? loginInfo['email'] || loginInfo['sub'] : ''
                let path = location.pathname
                ReactGA.initialize(window._env_.GA_TRACKING_ID, {
                    debug: false,
                    titleCase: false,
                    gaOptions: {
                        userId: `${email}`,
                    },
                })
                ReactGA.pageview(`${path}`)
                ReactGA.event({
                    category: `Page ${path}`,
                    action: 'First Land',
                })
                history.listen((location) => {
                    let path = location.pathname
                    path = path.replace(new RegExp('[0-9]', 'g'), '')
                    path = path.replace(new RegExp('//', 'g'), '/')
                    ReactGA.pageview(`${path}`)
                    ReactGA.event({
                        category: `Page ${path}`,
                        action: 'First Land',
                    })
                })
            }
        }

        //Only For the first time login user(with superadmin permission)
        if (!loginInfo) return

        getLoginData().then((response) => {
            const count = response.result?.value ? parseInt(response.result.value) : 0
            setLoginCount(count || 1)
            if (!count) {
                history.push('/')
            }
        })

        if (typeof Storage !== 'undefined') {
            if (localStorage.isDashboardLoggedIn) return
            dashboardLoggedIn()
                .then((response) => {
                    if (response.result) {
                        localStorage.isDashboardLoggedIn = true
                    }
                })
                .catch((errors) => {})
        }
    }, [])

    useEffect(() => {
        async function getServerMode() {
            try {
                const response = getVersionConfig()
                const json = await response
                if (json.code == 200) {
                    setServerMode(json.result.serverMode)
                    setPageState(ViewType.FORM)
                }
            } catch (err) {
                setPageState(ViewType.ERROR)
            }
        }
        getServerMode()
        getCurrentServerInfo()
    }, [])

    const getCurrentServerInfo = async (section?: string) => {
        if (
            currentServerInfo.fetchingServerInfo ||
            (section === 'navigation' && currentServerInfo.serverInfo && location.pathname.includes('/stack-manager'))
        ) {
            return
        }

        setCurrentServerInfo({
            serverInfo: currentServerInfo.serverInfo,
            fetchingServerInfo: true,
        })

        try {
            const { result } = await getServerInfo()
            setCurrentServerInfo({
                serverInfo: result,
                fetchingServerInfo: false,
            })
        } catch (err) {
            setCurrentServerInfo({
                serverInfo: currentServerInfo.serverInfo,
                fetchingServerInfo: false,
            })
            console.error('Error in fetching server info')
        }
    }

    if (pageState === ViewType.LOADING || loginLoader) {
        return <Progressing pageLoader />
    } else if (pageState === ViewType.ERROR) {
        return <Reload />
    } else {

const onClickedDeployManageCardClicked = () =>{
   setIsDeployManageCardClicked(true)
}
        return (
            <mainContext.Provider
                value={{
                    serverMode,
                    setServerMode,
                    setPageOverflowEnabled,
                    isHelpGettingStartedClicked,
                    showCloseButtonAfterGettingStartedClicked,
                    loginCount,
                    setLoginCount
                }}
            >
                <main className={`${window.location.href.includes(URLS.GETTING_STARTED) ? 'no-nav' : ''}`}>
                    {!window.location.href.includes(URLS.GETTING_STARTED) && (
                        <Navigation
                            history={history}
                            match={match}
                            location={location}
                            serverMode={serverMode}
                            fetchingServerInfo={currentServerInfo.fetchingServerInfo}
                            serverInfo={currentServerInfo.serverInfo}
                            getCurrentServerInfo={getCurrentServerInfo}
                        />
                    )}

                    {serverMode && (
                        <div className={`main ${pageOverflowEnabled ? '' : 'main__overflow-disabled'}`}>
                            <Suspense fallback={<Progressing pageLoader />}>
                                <ErrorBoundary>
                                    <Switch>
                                        <Route
                                            path={URLS.APP}
                                            render={() => (
                                                <AppRouter
                                                    isSuperAdmin={isSuperAdmin}
                                                    appListCount={appListCount}
                                                    loginCount={loginCount}
                                                />
                                            )}
                                        />
                                        <Route path={URLS.CHARTS} render={() => <Charts />} />
                                        <Route
                                            path={URLS.DEPLOYMENT_GROUPS}
                                            render={(props) => <BulkActions {...props} />}
                                        />
                                        <Route
                                            path={URLS.GLOBAL_CONFIG}
                                            render={(props) => <GlobalConfig {...props} />}
                                        />
                                        <Route path={URLS.CLUSTER_LIST}>
                                            <ClusterNodeContainer />
                                        </Route>
                                        <Route
                                            path={URLS.BULK_EDITS}
                                            render={(props) => <BulkEdit {...props} serverMode={serverMode} />}
                                        />
                                        <Route
                                            path={URLS.SECURITY}
                                            render={(props) => <Security {...props} serverMode={serverMode} />}
                                        />
                                        <Route path={URLS.STACK_MANAGER}>
                                            <DevtronStackManager
                                                serverInfo={currentServerInfo.serverInfo}
                                                getCurrentServerInfo={getCurrentServerInfo}
                                            />
                                        </Route>
                                        <Route exact path={`/${URLS.GETTING_STARTED}/${URLS.GUIDE}`}>
                                            <DeployManageGuide isDeployManageCardClicked={isDeployManageCardClicked} />
                                        </Route>
                                        <Route exact path={`/${URLS.GETTING_STARTED}`}>
                                            <OnboardingGuide
                                                loginCount={loginCount}
                                                isSuperAdmin={isSuperAdmin}
                                                serverMode={serverMode}
                                                onClickedDeployManageCardClicked={onClickedDeployManageCardClicked}
                                            />
                                        </Route>

                                        <Route>
                                            <RedirectUserWithSentry isFirstLoginUser={isSuperAdmin && (serverMode === SERVER_MODE.EA_ONLY && !loginCount) || (serverMode === SERVER_MODE.FULL && appListCount === 0)} />
                                        </Route>
                                    </Switch>
                                </ErrorBoundary>
                            </Suspense>
                        </div>
                    )}
                </main>
            </mainContext.Provider>
        )
    }
}

export function AppRouter({ isSuperAdmin, appListCount, loginCount }: AppRouterType) {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    return (
        <ErrorBoundary>
            <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
                <Switch>
                    <Route
                        path={`${path}/${URLS.APP_LIST}`}
                        render={() => (
                            <AppListRouter
                                isSuperAdmin={isSuperAdmin}
                                appListCount={appListCount}
                                loginCount={loginCount}
                            />
                        )}
                    />
                    <Route path={`${path}/${URLS.EXTERNAL_APPS}/:appId/:appName`} render={() => <ExternalApps />} />
                    <Route
                        path={`${path}/${URLS.DEVTRON_CHARTS}/deployments/:appId(\\d+)/env/:envId(\\d+)`}
                        render={(props) => <V2Details envType={EnvType.CHART} />}
                    />
                    <Route path={`${path}/:appId(\\d+)`} render={() => <AppDetailsPage isV2={false} />} />
                    <Route path={`${path}/v2/:appId(\\d+)`} render={() => <AppDetailsPage isV2={true} />} />

                    <Route exact path="">
                        <RedirectToAppList />
                    </Route>
                    <Route>
                        <RedirectUserWithSentry
                            isFirstLoginUser={(isSuperAdmin && appListCount === 0) || !loginCount}
                        />
                    </Route>
                </Switch>
            </AppContext.Provider>
        </ErrorBoundary>
    )
}

export function AppListRouter({ isSuperAdmin, appListCount, loginCount }: AppRouterType) {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    return (
        <ErrorBoundary>
            <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
                <Switch>
                    <Route path={`${path}/:appType`} render={() => <NewAppList isSuperAdmin={isSuperAdmin} appListCount={appListCount}/>} />
                    <Route exact path="">
                        <RedirectToAppList />
                    </Route>
                    <Route>
                        <RedirectUserWithSentry isFirstLoginUser = {isSuperAdmin && (appListCount === 0 || !loginCount)} />
                    </Route>
                </Switch>
            </AppContext.Provider>
        </ErrorBoundary>
    )
}

export function RedirectUserWithSentry({ isFirstLoginUser  }) {
    const { push } = useHistory()
    const { pathname } = useLocation()
    useEffect(() => {
      if (pathname && pathname !== '/') Sentry.captureMessage(`redirecting to app-list from ${pathname}`, 'warning')
        if (isFirstLoginUser) {
            push(`${URLS.GETTING_STARTED}`)
        } else {
            push(`${URLS.APP}/${URLS.APP_LIST}`)
        }
    }, [])
    return null
}

export function RedirectToAppList() {
    const { push } = useHistory()
    const { serverMode } = useContext(mainContext)
    useEffect(() => {
        let baseUrl = `${URLS.APP}/${URLS.APP_LIST}`
        if (serverMode == SERVER_MODE.FULL) {
            push(`${baseUrl}/${AppListConstants.AppType.DEVTRON_APPS}`)
        } else {
            push(`${baseUrl}/${AppListConstants.AppType.HELM_APPS}`)
        }
    }, [])
    return null
}
