import React from 'react'
import { URLS } from '../../config'
import { Redirect, Route, Switch } from 'react-router-dom'
import ClusterList from './ClusterList'
import NodeDetails from './NodeDetails'
import NodeList from './NodeList'

export default function ClusterNodeContainer() {
    return (
        <Switch>
            <Route path={URLS.CLUSTER_LIST} exact>
                <ClusterList />
            </Route>
            <Route path={`${URLS.CLUSTER_LIST}/:clusterId${URLS.NODES_LIST}`} exact>
                <NodeList />
            </Route>
            <Route path={`${URLS.CLUSTER_LIST}/:clusterId${URLS.NODES_LIST}/:nodeId${URLS.NODE_DETAILS}`} exact>
                <NodeDetails />
            </Route>
            <Redirect to={URLS.CLUSTER_LIST} />
        </Switch>
    )
}
