import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRouteMatch, useParams } from 'react-router';
import { NodeDetailTab } from '../nodeDetail/nodeDetail.type';
import IndexStore from '../../index.store';
import Tippy from '@tippyjs/react';
import { copyToClipboard } from '../../../../common';
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as Clipboard } from '../../../../../assets/icons/ic-copy.svg';
import PodHeaderComponent from './PodHeader.component';
import { NodeType, Node, iNode } from '../../appDetails.type';
import { useSharedState } from '../../../utils/useSharedState';
import './nodeType.css'
import { getNodeDetailTabs } from '../nodeDetail/nodeDetail.util';

function NodeComponent() {

    const { path, url } = useRouteMatch();
    const [selectedNodes, setSelectedNodes] = useState<Array<iNode>>()
    const [selectedHealthyNodeCount, setSelectedHealthyNodeCount] = useState<Number>(0)
    const [copied, setCopied] = useState(false);
    const [tableHeader, setTableHeader] = useState([]);
    const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable())
    const params = useParams<{ nodeType: NodeType }>()
    const [tabs, setTabs] = useState([])
    const [showServiceChildElement, hideServiceChildElement] = useState(false)

    useEffect(() => {
        if (!copied) return
        setTimeout(() => setCopied(false), 2000)
    }, [copied])

    useEffect(() => {

        if (params.nodeType) {
            const _tabs = getNodeDetailTabs(params.nodeType as NodeType)
            setTabs(_tabs)
        }

        let tableHeader;
        switch (params.nodeType) {
            case NodeType.Pod.toLowerCase():
                tableHeader = ["Pod (All)", "Ready", "Restarts", "Age", "Live sync status"]
                break;
            case NodeType.Service.toLowerCase():
                tableHeader = ["Name", "URL"]
                break;
            default:
                tableHeader = ["Name"]
                break;
        }

        setTableHeader(tableHeader)
        let _selectedNodes = IndexStore.getNodesByKind(params.nodeType)
        let _healthyNodeCount = 0
        
        _selectedNodes.forEach((node: Node) => {
            if (node.health?.status.toLowerCase() === "healthy") {
                _healthyNodeCount++
            }
        })

        setSelectedNodes([..._selectedNodes])
        setSelectedHealthyNodeCount(_healthyNodeCount)
    }, [params.nodeType])

    const makeNodeTree = (nodes: Array<iNode>) => {
        return nodes.map((node, index) => {
            return (
                <React.Fragment>
                    <div className="row m-0" key={'grt' + index}>
                        <div className={"col-md-6 pt-9 pb-9 flex left top pl-16"} >

                            {(node.childNodes?.length > 0) ? <DropDown
                                className={`rotate icon-dim-24 pointer ${node["isSelected"] ? 'fcn-9' : 'fcn-5'} `}
                                style={{ ['--rotateBy' as any]: !showServiceChildElement ? '-90deg' : '0deg' }}
                            /> : <span className="pl-12 pr-12"></span>}

                            <div className="flexbox">
                                <div>
                                    <div>{node.name}</div>
                                    <div className="cg-5">{node?.health?.status}</div>
                                </div>
                            </div>

                            <div className="hover-trigger">
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="bottom"
                                    content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                    trigger='mouseenter click'
                                >
                                    <Clipboard
                                        className="hover-only icon-dim-12 pointer ml-8 mr-8"
                                        onClick={(e) => copyToClipboard(node?.name, () => setCopied(true))}
                                    />
                                </Tippy>
                                {tabs && tabs.map((tab, index) => {
                                    return <NavLink key={"tab__" + index} to={`${url}/${node.name}/${tab.toLowerCase()}`} className="fw-6  cb-5 ml-6 cursor">{tab}</NavLink>
                                })}
                            </div>


                        </div>

                        {(params.nodeType === NodeType.Service.toLowerCase()) && <div className={"col-md-6 pt-9 pb-9 flex left"} >
                            {node.name + "." + node.namespace}  : portnumber
                        <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="bottom"
                                content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                trigger='mouseenter click'
                            >
                                <Clipboard
                                    className="hover-only icon-dim-18 pointer"
                                    onClick={(e) => copyToClipboard(node?.name, () => setCopied(true))}
                                />
                            </Tippy>
                        </div>}

                        {params.nodeType === NodeType.Pod.toLowerCase() &&
                            <React.Fragment>
                                <div className={"col-md-2 pt-9 pb-9"} > ... </div>
                                <div className={"col-md-1 pt-9 pb-9"} > ... </div>
                                <div className={"col-md-2 pt-9 pb-9"} > ... </div>
                                <div className={"col-md-1 pt-9 pb-9"} > ... </div>
                            </React.Fragment>
                        }
                    </div>

                    {(node.childNodes?.length > 0) &&
                        makeNodeTree(node.childNodes)
                    }
                </React.Fragment>
            )
        })
    }

    return (
        <div className="container-fluid generic-table ml-0 mr-0" style={{ paddingRight: 0, paddingLeft: 0 }}>
            {(params.nodeType === NodeType.Pod.toLowerCase()) ? <PodHeaderComponent /> :
                <div className="border-bottom  pt-10 pb-10" >
                    <div className="pl-16 fw-6 fs-14 text-capitalize">{params.nodeType}({selectedNodes?.length})</div>
                    <div className="pl-16"> {selectedHealthyNodeCount} healthy</div>
                </div>}

            <div className="row border-bottom fw-6 m-0 " style={{ paddingLeft: '40px' }}>
                {
                    tableHeader.map((cell, index) => {
                        return <div key={'gpt_' + index} className={(index === 0 ? "col-6 pt-9 pb-9 row__cell-val" : "col pt-9 pb-9")}>{cell}</div>
                    })
                }
            </div>


            <div className="generic-body">
                {
                    selectedNodes && makeNodeTree(selectedNodes)
                }
            </div>
        </div>
    )
}

export default NodeComponent

