import React, { useEffect, useState } from 'react';
import NodeTreeComponent from './NodeTree.component';
import FilterResource from './FilterResource';
import './k8resources.css';
import { Switch, Route } from 'react-router-dom';
import { useRouteMatch, useHistory } from 'react-router';
import { URLS } from '../../../../../config';
import ApplicationObjectStore from '../applicationObject.store';
import { useSharedState } from '../../../utils/useSharedState';
import AppDetailsStore from '../../appDetail.store';
import { iNode } from '../../node.type';
import { NodeType } from '../../appDetail.type';
import NodeDetailComponent from './NodeDetailComponent';

export default function K8ResourceComponent() {
    const [nodes] = useSharedState(AppDetailsStore.getAppDetailsNodes(), AppDetailsStore.getAppDetailsNodesObservable())

    const [selectedNode, setSelectedNode] = useState<iNode | undefined>(undefined)

    const { path, url } = useRouteMatch();

    const history = useHistory();

    //const params = useParams<{ action: string }>()

    // const updateNodeInfoCB = (node: iNode) => {
    //     setSelectedNode(node)
    // }

    const handleCallback = (_node: iNode) => {
        setSelectedNode(_node)
        let link = `${url.split(URLS.APP_DETAILS_K8)[0]}${URLS.APP_DETAILS_K8}/${_node.name.toLowerCase()}`;
        history.push(link);
    }

    useEffect(() => {
        ApplicationObjectStore.markApplicationObjectTabActive(URLS.APP_DETAILS_K8)

        //console.log("K8ResourceComponent params", params)

        // if(params.action){

        // }
    }, [])

    return (
        <div className="bcn-0">
            <div className="pt-16 pl-20 pb-16">
                <FilterResource />
            </div>
            <div className="container-fluid">
                <div className="row" >
                    <div className="col-md-2 k8-resources-node-tree">
                        {nodes.length > 0 && <NodeTreeComponent nodes={nodes} callback={handleCallback} />}
                    </div>
                    <div className="col-md-10">
                        <Switch>
                            {[...new Set(Object.keys(NodeType))].map((_nodeType) => {
                                return <NodeDetailComponent key={_nodeType} selectedNode={selectedNode} />
                            })}
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    )
}
function useParams<T>() {
    throw new Error('Function not implemented.');
}

