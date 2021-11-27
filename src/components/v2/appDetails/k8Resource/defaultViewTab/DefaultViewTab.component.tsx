import React, { useEffect, useState } from 'react'
import { DefaultViewTabsJSON } from '../../../utils/tabUtils/tab.json';
import { iLink } from '../../../utils/tabUtils/link.type';
import { TabActions, useTab } from '../../../utils/tabUtils/useTab';
import EventsComponent from './defaultViewActionTabs/Events.component';
import LogsComponent from './defaultViewActionTabs/Logs.component';
import ManifestComponent from './defaultViewActionTabs/Manifest.component';
import TerminalComponent from './defaultViewActionTabs/Terminal.component';
import './defaultViewTab.css';
import SummaryComponent from './defaultViewActionTabs/Summary.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useParams, useRouteMatch, useHistory } from 'react-router';
import AppDetailsStore from '../../appDetails.store';
import { NodeDetailTabs } from '../../node.type';

function DefaultViewTabComponent() {

    const [{ tabs }, dispatch] = useTab(DefaultViewTabsJSON);
    const [selectedTab, setSelectedTab] = useState("")
    const params = useParams<{ actionName: string, podName: string }>()
    const { path, url } = useRouteMatch()
    const history = useHistory();

    // const handleTabClick = (_tabName: string) => {
    //     dispatch({
    //         type: TabActions.MarkActive,
    //         tabName: _tabName
    //     })

    //     AppDetailsStore.setCurrentTab(_tabName)

    //     setSelectedTab(_tabName)
    // }

    useEffect(() => {
        if (params.podName) {
            AppDetailsStore.addApplicationObjectTab(params.podName, url)
        }
    }, [params.podName])


    useEffect(() => {
        if (params.podName && !params.actionName) {
            history.push(`${url}/${AppDetailsStore.getCurrentTab()}`)
            // handleTabClick(params.actionName)
        }
    }, [params.podName])

    return (
        <div>
            <div className="bcn-0 flex left top w-100 pl-20 border-bottom pr-20">
                {
                    tabs.map((tab: iLink, index: number) => {
                        return (
                            <div key={index + "resourceTreeTab"} className={`${tab.name.toLowerCase() === selectedTab.toLowerCase() ? 'default-tab-row' : ''} pt-6 pb-6 cursor pl-8 pr-8`}>
                                <NavLink to={`${url}/${tab.name.toLowerCase()}`} className=" no-decor flex left cn-7" >
                                    <span className="default-tab-cell"> {tab.name.toLowerCase()}</span>
                                </NavLink>
                            </div>
                        )
                    })
                }

            </div>
            <div>
                <Switch>
                    <Route path={`${path}/${NodeDetailTabs.MANIFEST}`} render={() => { return <ManifestComponent  /> }} />
                    <Route path={`${path}/${NodeDetailTabs.EVENTS}`} render={() => { return <EventsComponent /> }} />
                    <Route path={`${path}/${NodeDetailTabs.LOGS}`} render={() => { return <LogsComponent /> }} />
                    <Route path={`${path}/${NodeDetailTabs.SUMMARY}`} render={() => { return <SummaryComponent /> }} />
                    <Route path={`${path}/${NodeDetailTabs.TERMINAL}`} render={() => { return <TerminalComponent /> }} />
                </Switch>
            </div>
        </div>
    )
}

export default DefaultViewTabComponent
