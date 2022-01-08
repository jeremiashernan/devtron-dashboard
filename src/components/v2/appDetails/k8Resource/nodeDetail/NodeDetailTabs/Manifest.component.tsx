import React, { useEffect, useState } from 'react';
import { ManifestTabJSON } from '../../../../utils/tabUtils/tab.json';
import { iLink } from '../../../../utils/tabUtils/link.type';
import { TabActions, useTab } from '../../../../utils/tabUtils/useTab';
import { useParams, useRouteMatch } from 'react-router';
import { ReactComponent as Edit } from '../../../../assets/icons/ic-edit.svg';
import { NodeDetailTab } from '../nodeDetail.type';
import { getManifestResource, updateManifestResourceHelmApps } from '../nodeDetail.api';
import CodeEditor from '../../../../../CodeEditor/CodeEditor';
import IndexStore from '../../../index.store';
import MessageUI, { MsgUIType } from '../../../../common/message.ui';
import { AppType } from '../../../appDetails.type';
import YAML from 'yaml';

function ManifestComponent({ selectedTab, isDeleted }) {
    const [{ tabs, activeTab }, dispatch] = useTab(ManifestTabJSON);
    const { url } = useRouteMatch();
    const params = useParams<{ actionName: string; podName: string; nodeType: string }>();
    const [manifest, setManifest] = useState('');
    const [modifiedManifest, setModifiedManifest] = useState('');
    const [activeManifestEditorData, setActiveManifestEditorData] = useState('');
    const [desiredManifest, setDesiredManifest] = useState('');
    const appDetails = IndexStore.getAppDetails();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [isEditmode, setIsEditmode] = useState(false);

    useEffect(() => {
        setLoading(true);
        selectedTab(NodeDetailTab.MANIFEST, url);
        try {
            getManifestResource(appDetails, params.podName, params.nodeType)
                .then((response) => {
                    const _manifest =
                        appDetails.appType === AppType.EXTERNAL_HELM_CHART
                            ? JSON.stringify(response?.result?.manifest)
                            : response?.result?.manifest;
                    if (_manifest) {
                        setManifest(_manifest);
                        setActiveManifestEditorData(_manifest);
                        setModifiedManifest(_manifest);
                    } else {
                        setError(true);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    setError(true);
                    console.log('err', err);
                    setLoading(false);
                });
        } catch (err) {
            console.log('err', err);
        }
    }, [params.podName]);

    useEffect(() => {
        if (!isEditmode && activeManifestEditorData !== modifiedManifest) {
            setActiveManifestEditorData(modifiedManifest);
        }
    }, [isEditmode]);

    //For External

    const handleEditorValueChange = (codeEditorData: string) => {
        if (activeTab === 'Live manifest' && isEditmode) {
            setModifiedManifest(codeEditorData);
        }
    };
    const handleEditLiveManifest = () => {
        setIsEditmode(true);
        markActiveTab('Live manifest');
        setActiveManifestEditorData(modifiedManifest);
    };

    const handleApplyChanges = () => {
        setLoading(true);
        let manifestString;
        try {
            manifestString = JSON.stringify(YAML.parse(modifiedManifest));
        } catch (err2) {
            setErrorText(`Encountered data validation error while saving. “${err2}”`);
        }
        if(!manifestString){
          setLoading(false);
        }
        manifestString &&
            updateManifestResourceHelmApps(appDetails, params.podName, params.nodeType, manifestString)
                .then((response) => {
                    setIsEditmode(false);
                    const _manifest = JSON.stringify(response?.result?.manifest);
                    if (_manifest) {
                        setManifest(_manifest);
                        setErrorText(``);
                    } else {
                        setErrorText(`Encountered data validation error while saving. “Some error occured”`);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    setErrorText(`Encountered data validation error while saving. “${err.errors[0]?.internalMessage}”`);
                });
    };

    const handleCancel = () => {
        setIsEditmode(false);
        setModifiedManifest(manifest);
        setActiveManifestEditorData('');
    };

    const markActiveTab = (_tabName: string) => {
        dispatch({
            type: TabActions.MarkActive,
            tabName: _tabName,
        });
    };

    const updateEditor = (_tabName: string) => {
        switch (_tabName) {
            case 'Live manifest':
                setActiveManifestEditorData(modifiedManifest);
                break;
            case 'Compare':
                setActiveManifestEditorData(desiredManifest);
                break;
            case 'Desired manifest':
                setActiveManifestEditorData(desiredManifest);
                break;
        }
    };

    const handleTabClick = (_tab: iLink) => {
        if (_tab.isDisabled) {
            return;
        }
        markActiveTab(_tab.name);
        updateEditor(_tab.name);
    };

    useEffect(() => {
        if (params.actionName) {
            markActiveTab(params.actionName);
        }
    }, [params.actionName]);

    return isDeleted ? (
        <div>
            <MessageUI msg="This resource no longer exists" size={32} />
        </div>
    ) : (
        <div style={{ minHeight: '600px', background: '#0B0F22' }}>
            {error && !loading && <MessageUI msg="Manifest not available" size={24} />}
            {!error && (
                <>
                    <div className="bcn-0">
                        {appDetails.appType === AppType.EXTERNAL_HELM_CHART && (
                            <div className="flex left pl-20 pr-20 border-bottom">
                                {tabs.map((tab: iLink, index) => {
                                    return (
                                        <div
                                            key={index + 'tab'}
                                            className={` ${tab.isDisabled ? 'no-drop' : 'cursor'} pl-4 pt-8 pb-8 pr-4`}
                                        >
                                            <div
                                                className={`${
                                                    tab.isSelected ? 'selected-manifest-tab cn-0' : ' bcn-1'
                                                } bw-1 pl-6 pr-6 br-4 en-2 no-decor flex left`}
                                                onClick={() => handleTabClick(tab)}
                                            >
                                                {tab.name}
                                            </div>
                                        </div>
                                    );
                                })}

                                {activeTab === 'Live manifest' && (
                                    <>
                                        <div className="pl-16 pr-16">|</div>
                                        {!isEditmode ? (
                                            <div className="flex left cb-5 cursor" onClick={handleEditLiveManifest}>
                                                <Edit className="icon-dim-16 pr-4 fc-5 " /> Edit Live manifest
                                            </div>
                                        ) : (
                                            <div>
                                                <button className="apply-change" onClick={handleApplyChanges}>
                                                    Apply Changes
                                                </button>
                                                <button className="cancel-change" onClick={handleCancel}>
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        <CodeEditor
                            defaultValue={manifest}
                            diffView={activeTab === 'Compare'}
                            theme="vs-dark"
                            height={700}
                            value={activeManifestEditorData}
                            mode="yaml"
                            readOnly={activeTab !== 'Live manifest' || (!isEditmode && activeTab === 'Live manifest')}
                            onChange={handleEditorValueChange}
                            loading={loading}
                            customLoader={<MessageUI msg="fetching manifest" icon={MsgUIType.LOADING} size={24} />}
                        >
                            {activeTab === 'Compare' && (
                                <CodeEditor.Header hideDefaultSplitHeader={true}>
                                    <div className="split-header">
                                        <div className="left-pane">Live manifest</div>
                                        <div className="right-pane">Desired manifest</div>
                                    </div>
                                </CodeEditor.Header>
                            )}
                            {activeTab === 'Live manifest' && errorText && <CodeEditor.ErrorBar text={errorText} />}
                        </CodeEditor>
                    </div>
                </>
            )}
        </div>
    );
}

export default ManifestComponent;
