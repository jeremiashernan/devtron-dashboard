import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import './clusterNodes.scss'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { getClusterList } from './clusterNodes.service'
import { Progressing, showError, sortObjectArrayAlphabetically } from '../common'
import { ClusterDetail, ClusterListResponse } from './types'
import { URLS } from '../../config'

const clusterListData = [
    {
        id: 0,
        name: 'azure-cluster',
        nodeCount: 6,
        nodeErrors: ['string', 'string'],
        nodeK8sVersions: ['1.12.6_1546'],
        cpu: {
            name: 'string',
            usage: 'string',
            capacity: '6,503 GHz',
            request: 'string',
            limits: 'string',
        },
        memory: {
            name: 'string',
            usage: 'string',
            capacity: '26 TB',
            request: 'string',
            limits: 'string',
        },
    },
    {
        id: 1,
        name: 'azure-vm',
        nodeCount: 8,
        nodeErrors: [],
        nodeK8sVersions: ['1.12.6', '1.12.3', '1.12.8'],
        cpu: {
            name: 'string',
            usage: 'string',
            capacity: '6,503 GHz',
            request: 'string',
            limits: 'string',
        },
        memory: {
            name: 'string',
            usage: 'string',
            capacity: '26 TB',
            request: 'string',
            limits: 'string',
        },
    },
    {
        id: 2,
        name: 'bayern-cluster',
        nodeCount: 14,
        nodeErrors: ['string'],
        nodeK8sVersions: ['1.12.9'],
        cpu: {
            name: 'string',
            usage: 'string',
            capacity: '6,503 GHz',
            request: 'string',
            limits: 'string',
        },
        memory: {
            name: 'string',
            usage: 'string',
            capacity: '26 TB',
            request: 'string',
            limits: 'string',
        },
    },
    {
        id: 3,
        name: 'default_cluster',
        nodeCount: 26,
        nodeErrors: ['string'],
        nodeK8sVersions: ['1.11.6_1532'],
        cpu: {
            name: 'string',
            usage: 'string',
            capacity: '6,503 GHz',
            request: 'string',
            limits: 'string',
        },
        memory: {
            name: 'string',
            usage: 'string',
            capacity: '26 TB',
            request: 'string',
            limits: 'string',
        },
    },
]

export default function ClusterList() {
    const match = useRouteMatch()
    const [loader, setLoader] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [clusterList, setClusterList] = useState<ClusterDetail[]>([])

    useEffect(() => {
        //setLoader(true)
        // getClusterList()
        //     .then((response: ClusterListResponse) => {
        //         if (response.result) {
        //             setClusterList(response.result)
        //         }
        //         setLoader(false)
        //     })
        //     .catch((error) => {
        //         showError(error)
        //         setLoader(false)
        //     })
    }, [])

    const handleFilterChanges = (selected, key): void => {}

    const renderSearch = (): JSX.Element => {
        return (
            <form
                onSubmit={(e) => handleFilterChanges(e, 'search')}
                className="search position-rel margin-right-0 en-2 bw-1 br-4"
            >
                <Search className="search__icon icon-dim-18" />
                <input
                    type="text"
                    placeholder="Search charts"
                    value={searchText}
                    className="search__input bcn-0"
                    onChange={(event) => {
                        setSearchText(event.target.value)
                    }}
                />
                {searchApplied ? (
                    <button
                        className="search__clear-button"
                        type="button"
                        onClick={(e) => handleFilterChanges(e, 'clear')}
                    >
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button>
                ) : null}
            </form>
        )
    }

    if (loader) {
        return <Progressing />
    }

    return (
        <div className="cluster-list">
            {renderSearch()}
            <div className="mt-16 en-2 bw-1 bcn-0" style={{ minHeight: 'calc(100vh - 125px)' }}>
                <div className="cluster-list-row fw-6 cn-7 fs-12 border-bottom pt-8 pb-8 pr-20 pl-20 text-uppercase">
                    <div>Cluster</div>
                    <div>Status</div>
                    <div>Errors</div>
                    <div>Nodes</div>
                    <div>K8s version</div>
                    <div>CPU Capacity</div>
                    <div>Memory Capacity</div>
                </div>
                {clusterListData?.map((clusterData) => (
                    <div className="cluster-list-row fw-4 cn-9 fs-13 border-bottom-n1 pt-12 pb-12 pr-20 pl-20">
                        <div className="cb-5 ellipsis-right">
                            <NavLink to={`${match.url}/${clusterData.id}${URLS.NODES_LIST}`}>
                                {clusterData.name}
                            </NavLink>
                        </div>
                        <div>{clusterData['status']}</div>
                        <div>{clusterData.nodeErrors?.length > 0 ? clusterData.nodeErrors.length : ''}</div>
                        <div>{clusterData.nodeCount}</div>
                        <div>{clusterData.nodeK8sVersions[0]}</div>
                        <div>{clusterData.cpu?.capacity}</div>
                        <div>{clusterData.memory?.capacity}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
