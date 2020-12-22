//@ts-nocheck

import React, { useEffect, useState, useRef } from 'react'
import { Progressing, showError, useKeyDown, useAsync, useSearchString } from '../common';
import InfoIcon from '../../assets/icons/appstatus/info-filled.svg'
import { Spinner } from 'patternfly-react';
import LogViewer from '../LogViewer/LogViewer'
import { NoPod } from './ResourceTreeNodes'
import { get } from '../../services/api'
import { getNodeStatus } from './service'
import { Routes, Host } from "../../config";
import { toast } from 'react-toastify';
import YamljsParser from 'yamljs'
import sseWorker from './grepSSEworker';
import WebWorker from './WebWorker';
import { useParams } from 'react-router'
import moment from 'moment'
import { Subject } from '../../util/Subject';
import { AggregatedNodes, NodeDetailTabs, NodeDetailTabsType } from './types';
import { AppDetails } from '../app/types'
import { ReactComponent as CloseImage } from '../../assets/icons/ic-appstatus-cancelled.svg';
import { ReactComponent as Question } from '../../assets/icons/ic-question.svg';
import Tippy from '@tippyjs/react';
import { TerminalView } from '../terminal';
import { SocketConnectionType } from './details/appDetails/AppDetails';

const commandLineParser = require('command-line-parser')


const subject: Subject<string> = new Subject()

interface EventsLogsProps {
    nodeName: string;
    containerName: any;
    nodes: AggregatedNodes;
    logsPaused?: boolean;
    appDetails: AppDetails;
    subject?: Subject<string>;
    socketConnection: SocketConnectionType;
    terminalCleared: boolean;
    shell: { label; value; }
    selectShell: (shell: { label; value; }) => void;
    setTerminalCleared: (flag: boolean) => void;
    setSocketConnection: (value: SocketConnectionType) => void;
    handleLogPause: (paused: boolean) => void;
}

export function parsePipes(expression) {
    const pipes = expression.split(/[\|\s]*grep[\s]*/).filter(p => !!p)
    return pipes
}
export function getGrepTokens(expression) {
    const options = commandLineParser({
        args: expression.replace(/[\s]+/, " ").replace('"', "").split(" "),
        booleanKeys: ['v'],
        allowEmbeddedValues: true
    })
    let { _args, A = 0, B = 0, C = 0, a = 0, b = 0, c = 0, v = false } = options
    if (C || c) {
        A = C || c;
        B = C || c;
    }
    if (_args) {
        return ({ _args: _args[0], a: Number(A || a), b: Number(B || b), v })
    }
    else return null
}

const EventsLogs: React.FC<EventsLogsProps> = React.memo(function EventsLogs({ nodeName, containerName, nodes, appDetails, logsPaused, socketConnection, terminalCleared, shell, selectShell, setTerminalCleared, setSocketConnection, handleLogPause }) {
    const params = useParams<{ tab: NodeDetailTabsType; kind: string; appId: string; envId: string }>();
    return (
        <>
            {params.tab.toLowerCase() === NodeDetailTabs.EVENTS.toLowerCase() && (
                <>
                    <span style={{ background: '#2c3354' }} />
                    <EventsView nodeName={nodeName} appDetails={appDetails} nodes={nodes} />
                </>
            )}
            {params.tab.toLowerCase() === NodeDetailTabs.LOGS.toLowerCase() && (
                <LogsView
                    appDetails={appDetails}
                    subject={subject}
                    nodeName={nodeName}
                    containerName={containerName}
                    handleLogPause={handleLogPause}
                    logsPaused={logsPaused}
                />
            )}
            {params.tab.toLowerCase() === NodeDetailTabs.MANIFEST.toLowerCase() && (
                <>
                    <span style={{ background: '#2c3354' }} />
                    <NodeManifestView
                        nodeName={nodeName}
                        nodes={nodes}
                        appName={appDetails.appName}
                        environmentName={appDetails.environmentName}
                    />
                </>
            )}
            {params.tab.toLowerCase() === NodeDetailTabs.TERMINAL.toLowerCase() && (
                <>
                    <span style={{ background: '#2c3354' }} />
                    <TerminalView appDetails={appDetails}
                        nodeName={nodeName}
                        containerName={containerName}
                        socketConnection={socketConnection}
                        terminalCleared={terminalCleared}
                        shell={shell}
                        selectShell={selectShell}
                        setTerminalCleared={setTerminalCleared}
                        setSocketConnection={setSocketConnection}
                    />
                </>
            )}
        </>
    );
})

export const NodeManifestView: React.FC<{ nodeName: string; nodes: AggregatedNodes, appName: string, environmentName: string }> = ({ nodeName, nodes, appName, environmentName }) => {
    const { queryParams, searchParams } = useSearchString()
    const node = searchParams?.kind && nodes.nodes[searchParams.kind].has(nodeName) ? nodes.nodes[searchParams.kind].get(nodeName) : null
    const [loadingManifest, manifestResult, error, reload] = useAsync(() => getNodeStatus({ ...node, appName: `${appName}-${environmentName}` }), [node, searchParams?.kind], !!nodeName && !!node && !!searchParams.kind)
    const [manifest, setManifest] = useState(null)

    useEffect(() => {
        if (loadingManifest) return
        if (error) showError(error)
        if (manifestResult?.result?.manifest) {
            try {
                const manifest = JSON.parse(manifestResult?.result?.manifest);
                setManifest(manifest)
            }
            catch (err) {

            }
        }
    }, [loadingManifest, manifestResult, error])

    useEffect(() => {
        return () => {
            setManifest(null)
        }
    }, [nodeName])

    if (!node) {
        return null
    }
    return (
        <div className="flex w-100" style={{ gridColumn: '1 / span 2' }} data-testid="manifest-container">
            {loadingManifest && !manifest ? <Progressing data-testid="manifest-loader" pageLoader />
                : <>
                    { manifest
                        ? <textarea data-testid="manifest-textarea" className="pod-manifest-status" value={YamljsParser.stringify(manifest, 50, 4)} disabled></textarea>
                        : <NoEvents title="Manifest not available" />
                    }
                </>}
        </div>
    )
}

export const EventsView: React.FC<{ nodeName: string; appDetails: AppDetails, nodes: AggregatedNodes }> = ({ nodeName, appDetails, nodes }) => {
    const { searchParams } = useSearchString()
    const podsMap = nodes.nodes[searchParams.kind]
    const pod = podsMap && podsMap.has(nodeName) ? podsMap.get(nodeName) : null;
    const eventsUrl = `${Routes.APPLICATIONS}/${appDetails.appName}-${appDetails.environmentName}/events?resourceNamespace=${appDetails.namespace}&resourceUID=${pod?.uid}&resourceName=${nodeName}`;
    const [loading, eventsResult, error, reload] = useAsync(() => get(eventsUrl), [eventsUrl, pod?.name], !!pod)
    const events: { reason: string; message: string; count: number; lastTimestamp: string }[] = eventsResult?.result?.items || []
    if (!pod) return null
    return <div data-testid="events-container" style={{ height: 'calc( 100% + 1px )', overflowY: 'auto', gridColumn: '1 / span 2' }}>
        {events.filter(event => event).length > 0 && <div className="events-logs__events-table">
            <div className="events-logs__events-table-row header">
                {['reason', 'message', 'count', 'last timestamp'].map((head, idx) =>
                    <span className="events-logs__event" key={idx}>{head}</span>)}
            </div>
            {events.map((event, index) => <div className="events-logs__events-table-row" key={index}>
                <span className="events-logs__event">{event.reason}</span>
                <span className="events-logs__event">{event.message}</span>
                <span className="events-logs__event">{event.count}</span>
                <span className="events-logs__event">{moment(event.lastTimestamp, 'YYYY-MM-DDTHH:mm:ss').add(5, 'hours').add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>)
            }
        </div>}
        {nodeName && events.filter(event => event).length === 0 && <div className="flex" style={{ height: '100%', width: '100%' }}>
            {loading && <div style={{ width: '100%', textAlign: 'center' }}>
                <Spinner loading></Spinner>
                <div style={{ marginTop: '20px', color: 'rgb(156, 148, 148)' }}>fetching events</div>
            </div>}
            {!loading && events.filter(event => event).length === 0 && <NoEvents />}
        </div>}
        {!nodeName && <NoPod />}
    </div>
}

function NoEvents({ title = "Events not available" }) {
    return (
        <div style={{ width: '100%', textAlign: 'center' }}>
            <img src={InfoIcon} />
            <div style={{ marginTop: '20px', color: 'rgb(156, 148, 148)' }}>{title}</div>
        </div>
    )
}

interface LogsView {
    subject: Subject<string>;
    nodeName?: string;
    containerName: string;
    handleLogPause: (paused: boolean) => void;
    logsPaused: boolean;
    appDetails: AppDetails;
}

export const LogsView: React.FC<LogsView> = ({ subject, nodeName, containerName, handleLogPause, logsPaused, appDetails }) => {
    const key = useKeyDown()
    const [grepTokens, setGrepTokens] = React.useState(null);
    const [readyState, setReadyState] = React.useState(null);
    const workerRef = useRef(null);
    const logsPausedRef = useRef(false);
    const [logSearchString, setLogSearchString] = useState<string>('')
    const [tempSearch, setTempSearch] = useState<string>('')

    useEffect(() => {
        logsPausedRef.current = logsPaused;
    }, [logsPaused]);

    useEffect(() => {
        return () => {
            try {
                workerRef.current.postMessage({ type: 'stop' });
                workerRef.current.terminate();
            } catch (err) {
            }
            handleLogPause(false);
        };
    }, [])

    useEffect(() => {
        if (!nodeName || !containerName) return
        fetchLogs()
        return () => {
            try {
                workerRef.current.postMessage({ type: 'stop' });
                workerRef.current.terminate();
            } catch (err) { }
            handleLogPause(false);
        };
    }, [nodeName, containerName, grepTokens]);

    function getLogsURL() {
        let prefix = '';
        if (process.env.NODE_ENV === 'production') {
            prefix = `${location.protocol}//${location.host}`; // eslint-disable-line
        }
        return `${prefix}${Host}/api/v1/applications/${appDetails.appName}-${appDetails.environmentName}/pods/${nodeName}/logs?container=${containerName}&follow=true&namespace=${appDetails.namespace}&tailLines=500`;
    }

    useEffect(() => {
        if (!logSearchString) {
            setGrepTokens(null);
            return;
        }
        const pipes = parsePipes(logSearchString);
        const tokens = pipes.map((p) => getGrepTokens(p));
        if (tokens.some((t) => !t)) {
            toast.warn('Expression is invalid.');
            return
        }
        setGrepTokens(tokens)
    }, [logSearchString]);

    function handleMessage(event) {
        if (!event || !event.data || !event.data.result) return;
        if (logsPausedRef.current) {
            return;
        }
        event.data.result.forEach((log: string) => subject.publish(log));
        if (event.data.readyState) {
            setReadyState(event.data.readyState);
        }
    }

    function fetchLogs() {
        const url = getLogsURL();
        if (!url) {
            return
        }
        workerRef.current = new WebWorker(sseWorker);
        workerRef.current['addEventListener' as any]('message', handleMessage);
        workerRef.current['postMessage' as any]({
            type: 'start',
            payload: { grepTokens: grepTokens, url, timeout: 300 },
        });
    }

    function handleLogSearchSubmit(e) {
        e.preventDefault();
        setLogSearchString(tempSearch)
    }

    useEffect(() => {
        const combo = key.join()

        if (combo === "Control,c") {
            handleLogPause(!logsPaused)
        }
    }, [key.join()])

    const uniqueKey = nodeName + containerName + logSearchString
    const { length, [length - 1]: highlightString } = logSearchString.split(" ")
    return (
        <>
            {!nodeName && (
                <>
                    <span style={{ background: '#2c3354' }} />
                    <NoPod style={{ gridColumn: '1 / span 2' }} selectMessage="Select a pod to view logs" />
                </>
            )}
            {nodeName && !containerName && (
                <>
                    <span style={{ background: '#2c3354' }} />
                    <NoContainer style={{ gridColumn: '1 / span 2' }} selectMessage="Select a container to view logs" />
                </>
            )}
            {nodeName && containerName && (
                <>
                    <div data-testid="log-viewer-container" className="flex right" style={{ background: '#2c3354' }}>
                        <form
                            onSubmit={handleLogSearchSubmit}
                            className="log-search-form flex"
                            style={{ background: '#0b0f22' }}
                        >
                            <input
                                value={tempSearch}
                                onChange={(e) => setTempSearch(e.target.value)}
                                type="search"
                                name="logSearch"
                                placeholder='grep -A 10 -B 20 "Server Error" | grep 500'
                                style={{ height: '32px', background: 'transparent', color: 'white' }}
                            />
                            {tempSearch && (
                                <CloseImage
                                    className="icon-dim-20 pointer"
                                    onClick={(e) => {
                                        setLogSearchString('');
                                        setTempSearch('');
                                    }}
                                />
                            )}
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="bottom"
                                content={
                                    <div>
                                        <div className="flex column left">
                                            <h5>Supported grep commands</h5>
                                            <span>grep 500</span>
                                            <span>grep -A 2 -B 3 -C 5 error</span>
                                            <span>grep 500 | grep internal</span>
                                        </div>
                                    </div>
                                }
                            >
                                <Question />
                            </Tippy>
                        </form>
                    </div>
                    <div style={{ gridColumn: '1 / span 2' }} className="flex column log-viewer-container">
                        <div
                            className={`pod-readyState pod-readyState--top ${logsPaused || readyState === 2 ? 'pod-readyState--show' : ''
                                }`}
                        >
                            {logsPaused && (
                                <div className="w-100 cn-0">
                                    Stopped printing logs.{' '}
                                    <span
                                        onClick={(e) => handleLogPause(false)}
                                        className="pointer"
                                        style={{ textDecoration: 'underline' }}
                                    >
                                        Resume ( Ctrl+c )
                                    </span>
                                </div>
                            )}
                            {readyState === 2 && (
                                <div className="w-100 cn-0">
                                    Disconnected.{' '}
                                    <span
                                        onClick={(e) => fetchLogs()}
                                        className="pointer"
                                        style={{ textDecoration: 'underline' }}
                                    >
                                        Reconnect
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="log-viewer">
                            <LogViewer
                                subject={subject}
                                highlightString={highlightString}
                                rootClassName="event-logs__logs"
                                key={uniqueKey}
                            />
                        </div>
                        <div
                            className={`pod-readyState pod-readyState--bottom ${!logsPaused && [0, 1].includes(readyState) ? 'pod-readyState--show' : ''
                                }`}
                        >
                            {readyState === 0 && (
                                <div className="readyState loading-dots" style={{ color: 'orange' }}>
                                    Connecting
                                </div>
                            )}
                            {readyState === 1 && <div className="readyState loading-dots cg-5">Connected</div>}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

function NoContainer({ selectMessage = "Select a container to view events", style = {} }) {
    return <div className="no-pod no-pod--container" style={{ ...style }}>
        <div className="no-pod__container-icon">
            {Array(6).fill(0).map((z, idx) => <span key={idx} className="no-pod__container-sub-icon"></span>)}
        </div>
        <p>{selectMessage}</p>
    </div>
}

export default EventsLogs