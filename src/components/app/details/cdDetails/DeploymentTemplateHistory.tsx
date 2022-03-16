import React, { useCallback, useEffect, useReducer, useState } from 'react';
import CodeEditor from '../../../CodeEditor/CodeEditor';
import { mapByKey, showError, useEffectAfterMount } from '../../../common';
import { useParams } from 'react-router';
import YAML from 'yaml';
import { toast } from 'react-toastify';
import { getPreviousDeploymentTemplate, getDeploymentTemplateVersion } from './service';
import { chartRefAutocomplete } from '../../../EnvironmentOverride/service';

function DeploymentTemplateHistory({ setTempValue, currentConfiguration }) {
    const { appId, envId, pipelineId } = useParams<{ appId; envId; pipelineId }>();
    const [chartRefLoading, setChartRefLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [baseDeploymentTemplate, setBaseDeploymentTemplate] = useState<any>();
    const [charts, setCharts] = useState<Map<any, any>>();
    const [chartRefId, setChartRefId] = useState(0);
    const [previousChartVersion, setPreviousChartVersion] = useState();

    useEffect(() => {
        setLoading(true);
        initialise();
    }, [envId]);

    useEffect(() => {
        if (!chartRefLoading && chartRefId) {
            fetchDeploymentTemplate();
        }
    }, [chartRefLoading]);

    useEffect(() => {
        async function getDeploymentTemplatefromchartRef() {
            try {
                const { result } = await getDeploymentTemplateVersion(appId, chartRefId);
                setPreviousChartVersion(result.globalConfig.refChartTemplateVersion);
            } catch (err) {
                showError(err);
            }
        }
        getDeploymentTemplatefromchartRef();
    }, []);

    async function initialise() {
        setChartRefLoading(true);
        try {
            const { result } = await chartRefAutocomplete(+appId, +envId);
            setCharts(mapByKey(result.chartRefs, 'id'));
            setChartRefId(result.latestEnvChartRef || result.latestAppChartRef || result.latestChartRef);
        } catch (err) {
            showError(err);
        } finally {
            setChartRefLoading(false);
        }
    }

    async function fetchDeploymentTemplate() {
        try {
            const { result } = await getPreviousDeploymentTemplate(+appId, +envId, chartRefId);
            setBaseDeploymentTemplate(result);
            console.log(result);
        } catch (err) {
            showError(err);
        }
    }


    let isTemplateVersionDiff = isDeploymentConfigDiff()
    
    function isDeploymentConfigDiff () : boolean {
        if (currentConfiguration && currentConfiguration.templateVersion !== previousChartVersion) {
           return true;
        } 
        return
    };

    return (
        
        <div>
            <div className="en-2 bw-1 br-4 deployment-diff__upper bcn-0 mt-20 mb-16 mr-20 ml-20 pt-8 pb-8">
                <div className="">
                    <div className={`${isTemplateVersionDiff ? 'bcr-1' : ''} pl-16 pr-16 pt-8 pb-8`}>
                        <div className="cn-6">Chart version</div>
                        {currentConfiguration?.templateVersion ? <div className="cn-9">{currentConfiguration?.templateVersion}</div>: <div className=" inline-block"></div> }
                    </div>
                    <div className={`pl-16 pr-16 pt-8 pb-8`}>
                        <div className="cn-6">Application metrics</div>
                        <div className="cn-9">{currentConfiguration?.isAppMetricsEnabled ? 'Enable' : 'Disable'}</div>
                    </div>
                </div>
                <div className="">
                    <div className={`${isTemplateVersionDiff ? 'bcg-1' : ''} pl-16 pr-16 pt-8 pb-8`}>
                        <div className={`cn-6`}>Chart version</div>
                        {previousChartVersion ? <div className="cn-9">{previousChartVersion}</div>: <div className=" inline-block"></div>}
                        
                    </div>
                    <div className={`pl-16 pr-16 pt-8 pb-8`}>
                        <div className="cn-6">Application metrics</div>
                        <div className="cn-9">Disable</div>
                    </div>
                </div>
            </div>

            <div className=" form__row form__row--code-editor-container en-2 bw-1 br-4 mr-20 ml-20">
                <div className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">values.yaml</div>
                <div>
                    {baseDeploymentTemplate &&
                        baseDeploymentTemplate.globalConfig &&
                        currentConfiguration &&
                        currentConfiguration.template && (
                            <CodeEditor
                                value={YAML.stringify(baseDeploymentTemplate.globalConfig, { indent: 2 })}
                                onChange={(res) => setTempValue(res)}
                                defaultValue={currentConfiguration.template}
                                mode="yaml"
                                diffView={true}
                                readOnly={true}
                                loading={chartRefLoading}
                            ></CodeEditor>
                        )}
                </div>
            </div>
        </div>
    );
}

export default DeploymentTemplateHistory;
