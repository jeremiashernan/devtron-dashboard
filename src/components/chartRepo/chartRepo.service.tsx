import { Routes } from '../../config';
import { post, put, get } from '../../services/api';

export const getChartProviderConfig = (id: number): Promise<any> => {
    const URL = `${Routes.CHART_LIST}/${id}`;
    return get(URL);
}

export const updateChartProviderConfig = (request: any, id: number) => {
    const URL = `${Routes.CHART_AVAILABLE}/${Routes.CHART_REPO}/update`;
    return post(URL, request);
}

export const saveChartProviderConfig = (request: any, id: any) => {
    const URL = `${Routes.CHART_AVAILABLE}/${Routes.CHART_REPO}/create`;
    return post(URL, request);
}

export const validateChartRepoConfiguration = (request: any):Promise<any> => {
    const URL = `${Routes.CHART_AVAILABLE}/${Routes.CHART_REPO}/validate`;
    return post(URL, request);
}

export const reSyncChartRepo = ():Promise<any> => {
    const URL = `${Routes.CHART_AVAILABLE}/${Routes.CHART_REPO}/${Routes.CHART_RESYNC}`;
    return get(URL);
}