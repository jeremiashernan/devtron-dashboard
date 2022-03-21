import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import { toast } from 'react-toastify';
import { showError, Progressing, ErrorScreenManager } from '../../../common';
import {
    getReleaseInfo,
    ReleaseInfoResponse,
    ReleaseInfo,
    InstalledAppInfo,
    deleteApplicationRelease,
    updateApplicationRelease,
    UpdateApplicationRequest,
    linkToChartStore,
    LinkToChartStoreRequest,
} from '../../../external-apps/ExternalAppService';
import { deleteInstalledChart, getChartValues } from '../../../charts/charts.service';
import { ServerErrors } from '../../../../modals/commonTypes';
import { URLS } from '../../../../config';
import YAML from 'yaml';
import '../../../charts/modal/DeployChart.scss';
import {
    ChartEnvironmentSelector,
    ChartRepoSelector,
    ChartVersionValuesSelector,
    ActiveReadmeColumn,
    DeleteChartDialog,
    ChartValuesEditor,
    AppNotLinkedDialog,
} from '../common/ChartValuesSelectors';
import { ChartRepoOtions } from '../DeployChart';
import { ChartVersionType } from '../../../charts/charts.types';
import { fetchChartVersionsData, getChartValuesList } from '../common/chartValues.api';
import { getChartValuesURL } from '../../../charts/charts.helper';

function ExternalAppValues({ appId }: { appId: string }) {
    const history = useHistory();
    const { url } = useRouteMatch();

    const [isLoading, setIsLoading] = useState(true);
    const [isUpdateInProgress, setUpdateInProgress] = useState(false);
    const [isDeleteInProgress, setDeleteInProgress] = useState(false);
    const [errorResponseCode, setErrorResponseCode] = useState(undefined);
    const [readmeCollapsed, toggleReadmeCollapsed] = useState(true);
    const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo>(undefined);
    const [showDeleteAppConfirmationDialog, setShowDeleteAppConfirmationDialog] = useState(false);
    const [showAppNotLinkedDialog, setShowAppNotLinkedDialog] = useState(false);
    const [modifiedValuesYaml, setModifiedValuesYaml] = useState('');
    const [installedAppInfo, setInstalledAppInfo] = useState<InstalledAppInfo>(undefined);
    const [repoChartValue, setRepoChartValue] = useState<ChartRepoOtions>();
    const [chartVersionsData, setChartVersionsData] = useState<ChartVersionType[]>([]);
    const [chartValuesList, setChartValuesList] = useState([]);
    const [selectedVersion, selectVersion] = useState<any>();
    const [selectedVersionUpdatePage, setSelectedVersionUpdatePage] = useState<ChartVersionType>();
    const [chartValues, setChartValues] = useState<any>({});
    const deployChartRef = useRef<HTMLDivElement>(null);

    // component load
    useEffect(() => {
        getReleaseInfo(appId)
            .then((releaseInfoResponse: ReleaseInfoResponse) => {
                let _releaseInfo = releaseInfoResponse.result.releaseInfo;
                setReleaseInfo(_releaseInfo);

                if (!releaseInfoResponse.result.installedAppInfo) {
                    setRepoChartValue({
                        appStoreApplicationVersionId: 0,
                        chartRepoName: '',
                        chartId: 0,
                        chartName: _releaseInfo.deployedAppDetail.chartName,
                        version: _releaseInfo.deployedAppDetail.chartVersion,
                        deprecated: false,
                    });

                    const _chartVersionData = {
                        id: 0,
                        version: _releaseInfo.deployedAppDetail.chartVersion,
                    };

                    setSelectedVersionUpdatePage(_chartVersionData);
                    setChartVersionsData([_chartVersionData]);

                    const _chartValues = {
                        id: 0,
                        kind: 'EXISTING',
                        name: _releaseInfo.deployedAppDetail.appName,
                    };

                    setChartValues(_chartValues);
                    setChartValuesList([_chartValues]);
                }
                setInstalledAppInfo(releaseInfoResponse.result.installedAppInfo);
                setModifiedValuesYaml(YAML.stringify(JSON.parse(_releaseInfo.mergedValues)));
                setIsLoading(false);
            })
            .catch((errors: ServerErrors) => {
                showError(errors);
                setErrorResponseCode(errors.code);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (
            chartValues &&
            chartValues.id &&
            chartValues.chartVersion &&
            chartValues.name !== releaseInfo?.deployedAppDetail.appName
        ) {
            getChartValues(chartValues.id, chartValues.kind)
                .then((response) => {
                    setModifiedValuesYaml(response.result.values || '');
                })
                .catch((error) => {
                    showError(error);
                });
        } else if (
            releaseInfo &&
            releaseInfo.mergedValues &&
            releaseInfo.deployedAppDetail.appName === chartValues?.name
        ) {
            setModifiedValuesYaml(YAML.stringify(JSON.parse(releaseInfo?.mergedValues)));
        }
    }, [chartValues]);

    const handleRepoChartValueChange = (event) => {
        setRepoChartValue(event);
        fetchChartVersionsData(
            event.chartId,
            true,
            false,
            setSelectedVersionUpdatePage,
            setChartVersionsData,
            undefined,
            releaseInfo.deployedAppDetail.chartVersion,
            selectVersion,
        );
        getChartValuesList(
            event.chartId,
            (_chartValuesList) => {
                if (!installedAppInfo) {
                    _chartValuesList?.push({
                        id: 0,
                        kind: 'EXISTING',
                        name: releaseInfo.deployedAppDetail.appName,
                    });
                }

                setChartValuesList(_chartValuesList);
            },
            setChartValues,
        );
    };

    const deleteApplication = () => {
        if (isDeleteInProgress) {
            return;
        }
        setDeleteInProgress(true);
        setShowDeleteAppConfirmationDialog(false);
        getDeleteApplicationApi()
            .then(() => {
                setDeleteInProgress(false);
                toast.success('Successfully deleted.');
                let _url = `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`;
                history.push(_url);
            })
            .catch((errors: ServerErrors) => {
                showError(errors);
                setDeleteInProgress(false);
            });
    };

    const getDeleteApplicationApi = (): Promise<any> => {
        if (installedAppInfo && installedAppInfo.installedAppId) {
            return deleteInstalledChart(installedAppInfo.installedAppId);
        } else {
            return deleteApplicationRelease(appId);
        }
    };

    const updateApplication = (forceUpdate?: boolean) => {
        if (isUpdateInProgress) {
            return;
        }

        if (!forceUpdate && !repoChartValue?.chartRepoName) {
            setShowAppNotLinkedDialog(true);
            return;
        }

        // validate data
        try {
            JSON.stringify(YAML.parse(modifiedValuesYaml));
        } catch (err) {
            toast.error(`Encountered data validation error while updating. “${err}”`);
            return;
        }

        setUpdateInProgress(true);
        const payload = repoChartValue.chartRepoName
            ? {
                  appId: appId,
                  valuesYaml: modifiedValuesYaml,
                  appStoreApplicationVersionId: selectedVersionUpdatePage.id,
                  referenceValueId: selectedVersionUpdatePage.id,
                  referenceValueKind: chartValues.kind,
              }
            : {
                  appId: appId,
                  valuesYaml: modifiedValuesYaml,
              };

        (repoChartValue.chartRepoName
            ? linkToChartStore(payload as LinkToChartStoreRequest)
            : updateApplicationRelease(payload as UpdateApplicationRequest)
        )
            .then(() => {
                setUpdateInProgress(false);
                toast.success('Update and deployment initiated.');
                let _url = `${url.split('/').slice(0, -1).join('/')}/${URLS.APP_DETAILS}?refetchData=true`;
                history.push(_url);
            })
            .catch((errors: ServerErrors) => {
                showError(errors);
                setUpdateInProgress(false);
            });
    };

    const OnEditorValueChange = (codeEditorData: string) => {
        setModifiedValuesYaml(codeEditorData);
    };

    const redirectToChartValues = async () => {
        if (repoChartValue?.chartId) {
            history.push(getChartValuesURL(repoChartValue.chartId));
        }
    };

    function renderData() {
        return (
            <div
                className={`deploy-chart-container bcn-0 ${readmeCollapsed ? 'readmeCollapsed' : 'readmeOpen'}`}
                style={{ height: 'calc(100vh - 50px)' }}
            >
                <div className="header-container flex column"></div>
                <ActiveReadmeColumn
                    readmeCollapsed={readmeCollapsed}
                    toggleReadmeCollapsed={toggleReadmeCollapsed}
                    defaultReadme={releaseInfo.readme}
                    selectedVersionUpdatePage={selectedVersionUpdatePage}
                />
                <div className="deploy-chart-body">
                    <div className="overflown" ref={deployChartRef}>
                        <div className="hide-scroll">
                            <label className="form__row form__row--w-100">
                                <span className="form__label">Release Name</span>
                                <input
                                    className="form__input"
                                    value={releaseInfo.deployedAppDetail.appName}
                                    autoFocus
                                    disabled={true}
                                />
                            </label>
                            <ChartEnvironmentSelector
                                isExternal={true}
                                installedAppInfo={installedAppInfo}
                                releaseInfo={releaseInfo}
                            />
                            <ChartRepoSelector
                                isExternal={true}
                                installedAppInfo={installedAppInfo}
                                releaseInfo={releaseInfo}
                                handleRepoChartValueChange={handleRepoChartValueChange}
                                repoChartValue={repoChartValue}
                                chartDetails={{
                                    appStoreApplicationVersionId: 0,
                                    chartRepoName: releaseInfo.deployedAppDetail.chartName,
                                    chartId: 0,
                                    chartName: releaseInfo.deployedAppDetail.chartName,
                                    version: releaseInfo.deployedAppDetail.chartVersion,
                                    deprecated: false,
                                }}
                            />
                            {!installedAppInfo && repoChartValue?.chartRepoName && (
                                <ChartVersionValuesSelector
                                    isUpdate={true}
                                    selectedVersion={selectedVersion}
                                    selectVersion={selectVersion}
                                    selectedVersionUpdatePage={selectedVersionUpdatePage}
                                    setSelectedVersionUpdatePage={setSelectedVersionUpdatePage}
                                    chartVersionsData={chartVersionsData}
                                    chartValuesList={chartValuesList}
                                    chartValues={chartValues}
                                    setChartValues={setChartValues}
                                    hideVersionFromLabel={!installedAppInfo && chartValues.kind === 'EXISTING'}
                                    redirectToChartValues={redirectToChartValues}
                                />
                            )}
                            <ChartValuesEditor
                                valuesText={modifiedValuesYaml}
                                onChange={OnEditorValueChange}
                                repoChartValue={repoChartValue}
                                hasChartChanged={!!repoChartValue?.chartRepoName}
                                parentRef={deployChartRef}
                                autoFocus={!!installedAppInfo}
                            />
                        </div>
                    </div>
                </div>
                <div className="cta-container">
                    <button
                        className="cta delete"
                        disabled={isUpdateInProgress || isDeleteInProgress}
                        onClick={(e) => setShowDeleteAppConfirmationDialog(true)}
                    >
                        {isDeleteInProgress ? (
                            <div className="flex">
                                <span>Deleting</span>
                                <span className="ml-10">
                                    <Progressing />
                                </span>
                            </div>
                        ) : (
                            'Delete Application'
                        )}
                    </button>
                    <button
                        type="button"
                        tabIndex={6}
                        disabled={isUpdateInProgress || isDeleteInProgress}
                        className={`cta flex-1 ml-16 mr-16 ${
                            isUpdateInProgress || isDeleteInProgress ? 'disabled' : ''
                        }`}
                        onClick={() => updateApplication(false)}
                    >
                        {isUpdateInProgress ? (
                            <div className="flex">
                                <span>Updating and deploying</span>
                                <span className="ml-10">
                                    <Progressing />
                                </span>
                            </div>
                        ) : (
                            'Update and deploy'
                        )}
                    </button>
                </div>
                {showDeleteAppConfirmationDialog && (
                    <DeleteChartDialog
                        appName={releaseInfo.deployedAppDetail.appName}
                        handleDelete={deleteApplication}
                        toggleConfirmation={setShowDeleteAppConfirmationDialog}
                    />
                )}
                {showAppNotLinkedDialog && (
                    <AppNotLinkedDialog close={() => setShowAppNotLinkedDialog(false)} update={updateApplication} />
                )}
            </div>
        );
    }

    return (
        <>
            {isLoading && (
                <div className="loading-wrapper">
                    <Progressing pageLoader />
                </div>
            )}

            {!isLoading && errorResponseCode && (
                <div className="loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )}

            {!isLoading && !errorResponseCode && releaseInfo && renderData()}
        </>
    );
}

export default ExternalAppValues;
