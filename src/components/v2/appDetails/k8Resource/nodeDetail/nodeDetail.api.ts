import { Routes } from '../../../../../config';
import { get, post } from '../../../../../services/api';
import { AppDetails, AppType } from '../../appDetails.type';

export const getManifestResource = (ad: AppDetails, podName: string, nodeType: string) => {
    if (ad.appType === AppType.EXTERNAL_HELM_CHART) {
        return getManifestResourceHelmApps(ad, podName, nodeType);
    }
    const cn = ad.resourceTree.nodes.filter((node) => node.name === podName && node.kind.toLowerCase() === nodeType)[0];

    return get(
        `api/v1/applications/${ad.appName}-${ad.environmentName}/resource?version=${cn.version}&namespace=${
            ad.namespace
        }&group=${cn.group || ''}&kind=${cn.kind}&resourceName=${cn.name}`,
    );
};

export const getEvent = (ad: AppDetails, nodeName: string, nodeType: string) => {
    if (ad.appType === AppType.EXTERNAL_HELM_CHART) {
        return getEventHelmApps(ad, nodeName, nodeType);
    }
    const cn = ad.resourceTree.nodes.filter(
        (node) => node.name === nodeName && node.kind.toLowerCase() === nodeType,
    )[0];
    return get(
        `api/${cn.version}/applications/${ad.appName}-${ad.environmentName}/events?resourceNamespace=${ad.namespace}&resourceUID=${cn.uid}&resourceName=${cn.name}`,
    );
};

function createBody(appDetails: AppDetails, nodeName: string, nodeType: string) {
    const selectedResource = appDetails.resourceTree.nodes.filter(
        (data) => data.name === nodeName && data.kind.toLowerCase() === nodeType,
    )[0];
    return {
        appIdentifier: {
            clusterId: appDetails.clusterId,
            namespace: selectedResource.namespace,
            releaseName: appDetails.appName,
        },
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: selectedResource.group ? selectedResource.group : '',
                    Version: selectedResource.version ? selectedResource.version : 'v1',
                    Kind: selectedResource.kind,
                },
                namespace: selectedResource.namespace,
                name: selectedResource.name,
            },
            // podLogsRequest: {
            //     containerName: 'envoy',
            // },
        },
    };
}

function getManifestResourceHelmApps(ad: AppDetails, nodeName: string, nodeType: string) {
    const requestData = createBody(ad, nodeName, nodeType);
    return post(Routes.MANIFEST, requestData);
}

function getEventHelmApps(ad: AppDetails, nodeName: string, nodeType: string) {
    const requestData = createBody(ad, nodeName, nodeType);
    return post(Routes.EVENTS, requestData);
}

export const getLogsURL = (ad, nodeName, Host, container) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0];
    let prefix = '';
    if (process.env.NODE_ENV === 'production') {
        prefix = `${location.protocol}//${location.host}`; // eslint-disable-line
    } else {
        prefix = `${location.protocol}//${location.host}`; // eslint-disable-line
    }
    return `${prefix}${Host}/api/v1/applications/${ad.appName}-${ad.environmentName}/pods/${nodeName}/logs?container=${container}&follow=true&namespace=${ad.namespace}&tailLines=500`;
};

export const getTerminalData = (ad: AppDetails, nodeName: string, terminalType: string) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0];
    const _url = `api/${cn.version}/applications/pod/exec/session/${ad.appId}/${ad.environmentId}/${ad.namespace}/${ad.appName}-${ad.environmentName}/${terminalType}/${ad.appName}`;

    console.log('getTerminalData', _url);
    return get(_url);
};
