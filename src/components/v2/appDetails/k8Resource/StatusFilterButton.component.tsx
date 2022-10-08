import React, { useEffect } from 'react'
import IndexStore from '../index.store'
import { useState } from 'react'
import { NodeStatus, StatusFilterButtonType } from '../appDetails.type'
import { RadioGroup } from '../../../common'
import './k8resources.scss'

interface TabState {
    status: string
    count: number
    isSelected: boolean
}

export const StatusFilterButtonComponent = ({ nodes, handleFilterClick }: StatusFilterButtonType) => {
    const [selectedTab, setSelectedTab] = useState('all')

    let allNodeCount: number = 0,
        healthyNodeCount: number = 0,
        progressingNodeCount: number = 0,
        failedNodeCount: number = 0,
        missingNodeCount: number = 0

    nodes?.forEach((_node) => {
        let _nodeHealth = _node.health?.status

        if (_nodeHealth?.toLowerCase() === NodeStatus.Healthy) {
            healthyNodeCount++
        } else if (_nodeHealth?.toLowerCase() === NodeStatus.Degraded) {
            failedNodeCount++
        } else if (_nodeHealth?.toLowerCase() === NodeStatus.Progressing) {
            progressingNodeCount++
        } else if (_nodeHealth?.toLowerCase() === NodeStatus.Missing) {
            missingNodeCount++
        }
        allNodeCount++
    })

    const filters = [
        { status: 'ALL', count: allNodeCount, isSelected: 'all' == selectedTab },
        { status: NodeStatus.Missing, count: missingNodeCount, isSelected: NodeStatus.Missing == selectedTab },
        { status: NodeStatus.Degraded, count: failedNodeCount, isSelected: NodeStatus.Degraded == selectedTab },
        {
            status: NodeStatus.Progressing,
            count: progressingNodeCount,
            isSelected: NodeStatus.Progressing == selectedTab,
        },
        { status: NodeStatus.Healthy, count: healthyNodeCount, isSelected: NodeStatus.Healthy == selectedTab },
    ]

    useEffect(() => {
        if (handleFilterClick) {
            handleFilterClick(selectedTab.toUpperCase())
        } else {
            IndexStore.updateFilterType(selectedTab.toUpperCase())
        }
    }, [nodes, selectedTab])

    const handleTabSwitch = (event): void => {
        setSelectedTab(event.target.value.toLowerCase())
    }

    return (
        <RadioGroup
            className="status-filter-button gui-yaml-switch"
            name="yaml-mode"
            initialTab={'ALL'}
            disabled={false}
            onChange={handleTabSwitch}
        >
            {filters.length &&
                filters.map(
                    (filter: TabState, index: number) =>
                        filter['count'] > 0 && (
                            <RadioGroup.Radio value={filter.status}>
                                {index !== 0 && (
                                    <span
                                        className={`dc__app-summary__icon icon-dim-16 mr-6 ${filter.status.toLowerCase()} ${filter.status.toLowerCase()}--node`}
                                        style={{ zIndex: 'unset' }}
                                    />
                                )}
                                <span className="dc__first-letter-capitalize">{filter.status.toLowerCase()}</span>
                                <span className="pl-4">({filter.count})</span>
                            </RadioGroup.Radio>
                        ),
                )}
        </RadioGroup>
    )
}
