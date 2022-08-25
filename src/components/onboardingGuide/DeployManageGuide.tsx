import React, { useEffect, useState } from 'react'
import HelmSearch from '../../assets/img/guided-helm-search.png'
import HelmInCluster from '../../assets/img/guided-helm-cluster.png'
import ChartRepository from '../../assets/img/guided-chart-repository.png'
import HelmCollage from '../../assets/img/guided-helm-collage.png'
import { NavLink, useHistory } from 'react-router-dom'
import { URLS } from '../../config'
import { ReactComponent as GoBack } from '../../assets/icons/ic-arrow-forward.svg'
import './onboardingGuide.scss'
import ReactGA from 'react-ga'
import { OpaqueModal } from '../common'
import { getDevtronInstalledHelmApps } from '../app/list-new/AppListService'

function DeployManageGuide() {
    const history = useHistory()
    const [devtronHelmCount, setDevtronHelmCount] = useState(0)

    useEffect(() => {
       getDevtronInstalledHelmApps('').then((response) => {
        setDevtronHelmCount(response.result.helmApps.length)
       })
    })
    const redirectToOnboardingPage = () => {
        history.goBack()
    }

    const onClickViewApplication = () => {
        ReactGA.event({
            category: 'Onboarding',
            action: 'Onboarding Guide Clicked',
        })
    }

    return (
        <OpaqueModal>
            <div className="deploy-manage-container">
                <div className="deploy-manage__header flex h-300">
                    <div className="bcn-0 deploy_arrow flex cursor" onClick={redirectToOnboardingPage}>
                        <GoBack className="rotate icon-dim-24" style={{ ['--rotateBy' as any]: '180deg' }} />
                    </div>
                    <div className="ml-32">
                        <h1 className="fw-6 mb-8">Deploy and manage helm apps</h1>
                        <p className="fs-14 cn-7">This helps us in guiding you towards relevant product features</p>
                    </div>
                </div>
                <div className="deploy-manage__body bcn-0 flex">
                    <div className="deploy-manage-cards__wrap">
                        {devtronHelmCount > 0 && (
                            <div className="deploy-card bcn-0 flex w-400 br-4 en-2 bw-1 ">
                                <img
                                    className=" bcn-1"
                                    src={HelmSearch}
                                    width="200"
                                    height="150"
                                    alt="Please connect cluster"
                                />
                                <div className="fw-6 fs-16 pl-20 pr-20">
                                    {devtronHelmCount} helm applications found in default_cluster <br />
                                    <NavLink
                                        to={`${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`}
                                        activeClassName="active"
                                        onClick={onClickViewApplication}
                                    >
                                        View applications
                                    </NavLink>
                                </div>
                            </div>
                        )}

                        <div className="deploy-card bcn-0 flex w-400 br-4 en-2 bw-1 ">
                            <img
                                className=" bcn-1"
                                src={HelmCollage}
                                width="200"
                                height="150"
                                alt="Please connect cluster"
                            />
                            <div className="fw-6 fs-16 pl-20 pr-20">
                                I want to deploy popular helm charts <br />
                                <NavLink to={URLS.CHARTS_DISCOVER} activeClassName="active">
                                    Browse helm charts
                                </NavLink>
                            </div>
                        </div>
                        <div className="deploy-card bcn-0  flex w-400 br-4 en-2 bw-1 ">
                            <img
                                className=" bcn-1"
                                src={HelmInCluster}
                                width="200"
                                height="150"
                                alt="Please connect cluster"
                            />
                            <div className="fw-6 fs-16 pl-20 pr-20">
                                I have helm applications in other clusters <br />
                                <NavLink to={URLS.GLOBAL_CONFIG_CLUSTER} activeClassName="active">
                                    Connect a cluster
                                </NavLink>
                            </div>
                        </div>
                        <div className="deploy-card bcn-0 flex w-400 br-4 en-2 bw-1 ">
                            <img
                                className=" bcn-1"
                                src={ChartRepository}
                                width="200"
                                height="150"
                                alt="Please connect cluster"
                            />
                            <div className="fw-6 fs-16 pl-20 pr-20">
                                I want to connect my own chart repository <br />
                                <NavLink to={URLS.GLOBAL_CONFIG_CHART} activeClassName="active">
                                    Connect chart repository
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </OpaqueModal>
    )
}

export default DeployManageGuide
