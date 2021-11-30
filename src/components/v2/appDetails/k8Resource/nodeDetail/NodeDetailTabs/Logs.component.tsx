import Tippy from '@tippyjs/react';
import React, { useEffect, useState } from 'react'
import { ReactComponent as PlayButton } from '../../../../assets/icons/ic-play.svg';
import { ReactComponent as StopButton } from '../../../../assets/icons/ic-stop.svg';
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg';
import { useParams, useRouteMatch, useHistory } from 'react-router';
import AppDetailsStore from '../../../appDetails.store';
import { NodeDetailTab } from '../nodeDetail.type';

function LogsComponent({selectedTab}) {
    const [logsPaused, toggleLogStream] = useState(false);
    const [terminalCleared, setTerminalCleared] = useState(false);
    const { path, url } = useRouteMatch()
    const params = useParams<{ actionName: string, podName: string }>()

    useEffect(() => {
        selectedTab(NodeDetailTab.LOGS)
        if (params.podName) {
            AppDetailsStore.addApplicationObjectTab(params.podName, url)
        }
    }, [params.podName])

    // useEffect(() => {
    //     selectedTab(NodeDetailTabs.LOGS)
    // }, [])

    function handleLogsPause(paused: boolean) {
        toggleLogStream(paused);
    }

    return (<>
        <div className="flex left bcn-0 pl-20 pt-8">
            <Tippy
                className="default-tt"
                arrow={false}
                placement="bottom"
                content={logsPaused ? 'Resume logs (Ctrl+C)' : 'Stop logs (Ctrl+C)'}
            >
                <div
                    className={`toggle-logs mr-12 ${logsPaused ? 'play' : 'stop'}`}
                    onClick={(e) => handleLogsPause(!logsPaused)}
                >
                    {logsPaused ? <PlayButton className="icon-dim-16"/> : <StopButton className="stop-btn icon-dim-16 br-4 fcr-5" />}
                </div>
            </Tippy>


            <Tippy className="default-tt"
                arrow={false}
                placement="bottom"
                content={'Clear'} >
                <div>
                    <Abort className="icon-dim-20" onClick={(e) => { setTerminalCleared(true); }} />
                </div>
            </Tippy>

            <span className="cn-2 mr-8 ml-8" style={{ width: '1px', height: '16px', background: '#0b0f22' }} />

            <div className="cn-6">Container <span className="cn-9">dashboard-devtron</span></div>

            <span className="cn-2 ml-8 mr-8" style={{ width: '1px', height: '16px', background: '#0b0f22' }} />

            <div className="cn-6">sh <span className="cn-9">dashboard-devtron</span></div>

        </div>

        <div className="bcy-2 loading-dots pl-20 fs-13 pt-2 pb-2">
            Connecting
        </div>

        <div className="bcn-0 pl-20 pr-20" style={{ height: '460px' }}>

        </div>
    </>
    )
}

export default LogsComponent
