import React, { useEffect } from 'react'
import { ReactComponent as RightArrow } from '../../../../../assets/icons/ic-arrow-left.svg'
import { NavLink } from 'react-router-dom'
import { useRouteMatch, useParams } from 'react-router'
import { DeploymentTemplateConfiguration } from '../cd.type'
import CDEmptyState from '../CDEmptyState'
import { DEPLOYMENT_HISTORY_LINK_MAP, DEPLOYMENT_HISTORY_LIST } from './constants'

interface TemplateConfiguration {
    setShowTemplate: (boolean) => void
    deploymentTemplatesConfiguration: DeploymentTemplateConfiguration[]
    setBaseTimeStamp
    baseTimeStamp: string
}

export default function DeploymentTemplateWrapper({
    setShowTemplate,
    deploymentTemplatesConfiguration,
    setBaseTimeStamp,
    baseTimeStamp,
}: TemplateConfiguration) {
    const match = useRouteMatch()
    const { triggerId } = useParams<{ triggerId: string }>()
    const deploymentTemplateFilteredTrigger = deploymentTemplatesConfiguration?.find(
        (dt) => dt.wfrId.toString() === triggerId,
    )
    const isLastDeploymentTemplatesConfiguration =
        deploymentTemplatesConfiguration &&
        deploymentTemplatesConfiguration.length > 0 &&
        deploymentTemplatesConfiguration[deploymentTemplatesConfiguration.length - 1]?.wfrId.toString() === triggerId

    return deploymentTemplateFilteredTrigger && !isLastDeploymentTemplatesConfiguration ? (
        <>
            {DEPLOYMENT_HISTORY_LIST.map((li, index) => {
                return (
                    <div className="m-20 fs-13 cn-9" key={`history-list__${index}`}>
                        <NavLink
                            to={`${match.url}/${DEPLOYMENT_HISTORY_LINK_MAP[li.label.toLowerCase()]}`}
                            activeClassName="active"
                            onClick={() => {
                                setShowTemplate(true)
                                setBaseTimeStamp(baseTimeStamp)
                            }}
                            className="bcb-1 no-decor bcn-0 cn-9 pl-16 pr-16 pt-9 pb-9 br-4 en-2 bw-1 mb-20 flex content-space cursor"
                        >
                            {li.label}
                            <RightArrow className="rotate icon-dim-20" style={{ ['--rotateBy' as any]: '180deg' }} />
                        </NavLink>
                    </div>
                )
            })}
        </>
    ) : (
        <CDEmptyState />
    )
}
