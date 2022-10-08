import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import NodeTreeComponent from './nodeType/NodeTree.component';
import FilterResource from './FilterResource';
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store';
import NodeComponent from './nodeType/Node.component';
import { useSharedState } from '../../utils/useSharedState';
import IndexStore from '../index.store';
import './k8resources.scss';
import { ExternalLink, OptionTypeWithIcon } from '../../../externalLinks/ExternalLinks.type';

export default function K8ResourceComponent({
    clickedNodes,
    registerNodeClick,
    handleFocusTabs,
    externalLinks,
    monitoringTools,
    isDevtronApp,
}: {
    clickedNodes: Map<string, string>;
    registerNodeClick: Dispatch<SetStateAction<Map<string, string>>>;
    handleFocusTabs: () => void;
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
    isDevtronApp?: boolean
}) {
    const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable());

    useEffect(() => {
        AppDetailsStore.markAppDetailsTabActiveByIdentifier(AppDetailsTabs.k8s_Resources);
    }, []);

    return (
        <div className="bcn-0" style={{ justifyContent: 'space-between' }}>
            <div className="pt-16 pl-20 pb-16">
                <FilterResource nodes={nodes} />
            </div>
            {nodes.length > 0 ? (
                <div className="resource-node-wrapper flexbox">
                    <div className="k8-resources-node-tree pt-8 pl-16 dc__border-right">
                        <NodeTreeComponent clickedNodes={clickedNodes} registerNodeClick={registerNodeClick} isDevtronApp={isDevtronApp} />
                    </div>
                    <div className="flex-grow-1 p-0">
                        <NodeComponent handleFocusTabs={handleFocusTabs} externalLinks={externalLinks} monitoringTools={monitoringTools} isDevtronApp={isDevtronApp} />
                    </div>
                </div>
            ) : (
                <div>Empty UI</div>
            )}
        </div>
    );
}
