import React, { useEffect } from 'react'
import HelmCollage from '../../assets/img/helm-collage.png'
import DeployCICD from '../../assets/img/guide-onboard.png'
import { NavLink, useRouteMatch, useHistory } from 'react-router-dom'
import { DOCUMENTATION, SERVER_MODE, URLS } from '../../config'
import './onboardingGuide.scss'
import PreviewImage from '../../assets/img/ic-preview.png'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { OpaqueModal } from '../common'
import { OnboardingGuideProps } from '../common/guidePage/onboarding.type'

function OnboardingGuide({ loginCount, serverMode }: OnboardingGuideProps) {
    const match = useRouteMatch()
    const history = useHistory()

    const onClickCloseButton = () => {
        history.goBack()
    }

    const redirectDeployCardToCICD = (): string => {
        if (serverMode === SERVER_MODE.FULL) {
            return `${URLS.APP}/${URLS.APP_LIST}`
        } else {
            return `${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}?id=cicd`
        }
    }

    return (
        <OpaqueModal>
            <div className="onboarding-container h-100">
                <div className="onboarding__upper bc-window bcn-1">
                    {loginCount > 1 && (
                        <button
                            type="button"
                            className="w-100 flex right transparent p-20"
                            onClick={onClickCloseButton}
                        >
                            <Close className="icon-dim-24" />
                        </button>
                    )}
                    <div className="flex column">
                        <h1 className="fw-6 mb-8">What will you use devtron for?</h1>
                        <p className="fs-14 cn-7">This will help us in guiding you towards relevant product features</p>
                    </div>
                </div>
                <div className="bcn-0 onboarding__bottom flex position-rel cn-9">
                    <div className="onboarding-cards__wrap">
                        <div className="bcn-0 w-300 br-4 en-2 bw-1 cursor">
                            <a
                                className="learn-more__href cn-9"
                                href={DOCUMENTATION.PREVIEW_DEVTRON}
                                rel="noreferrer noopener"
                                target="_blank"
                            >
                                <img className="onboarding-card__img" src={PreviewImage} width="250" height="250" />
                                <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">
                                    Explore a preconfigured Demo at <span className="cb-5">preview.devtron.ai</span>
                                </div>
                            </a>
                        </div>
                        <div className='onboarding__line'/>
                        <div className="onboarding-card__left bcn-0 w-300 br-4 en-2 bw-1 cursor">
                            <NavLink
                                to={`${match.path}/${URLS.GUIDE}`}
                                className="no-decor fw-6 cursor cn-9"
                                activeClassName="active"
                            >
                                <img
                                    className="onboarding-card__img"
                                    src={HelmCollage}
                                    alt="Please connect cluster"
                                />
                                <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">
                                    Deploy and manage helm applications
                                </div>
                            </NavLink>
                        </div>

                        <div className="bcn-0 w-300 br-4 en-2 bw-1 cursor">
                            <NavLink
                                to={redirectDeployCardToCICD()}
                                className="no-decor fw-6 cursor cn-9"
                                activeClassName="active"
                            >
                                <img
                                    className="onboarding-card__img"
                                    src={DeployCICD}
                                    alt="Please connect cluster"
                                />
                                <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24">
                                    Deploy custom applications using CI/CD pipelines
                                </div>
                            </NavLink>
                        </div>
                    </div>
                    <div className="fs-14 mt-120 flex column">
                        <NavLink to={`${URLS.APP}/${URLS.APP_LIST}`} className="cb-5 fw-6 cursor mb-8">
                            Skip and explore Devtron on your own
                        </NavLink>
                        <div className="cn-7">Tip: You can return here anytime from the Help menu</div>
                    </div>
                </div>
            </div>
        </OpaqueModal>
    )
}

export default OnboardingGuide
