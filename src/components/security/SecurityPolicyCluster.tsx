import React, { Component } from 'react';
import { RouteComponentProps, NavLink } from 'react-router-dom';
import { SecurityPolicyEdit } from './SecurityPolicyEdit';
import { getClusterListMinNoAuth } from './security.service';
import { showError, Progressing, sortCallback } from '../common';
import { ViewType } from '../../config';
import { SecurityPolicyClusterState } from './security.types';
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg';
import Reload from '../Reload/Reload';

export class SecurityPolicyCluster extends Component<RouteComponentProps<{ clusterId: string; }>, SecurityPolicyClusterState> {

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            clusterSearch: "",
            clusterList: []
        }
        this.handleSearchChange = this.handleSearchChange.bind(this);
    }

    componentDidMount() {
        getClusterListMinNoAuth().then((response) => {
            let list = response.result || [];
            list = list.map((env) => {
                return {
                    id: env.id,
                    name: env.cluster_name,
                }
            })
            list = list.sort((a, b) => sortCallback('name', a, b))
            this.setState({ clusterList: list, view: ViewType.FORM });
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR });
        })
    }

    handleSearchChange(e) {
        this.setState({ clusterSearch: e.target.value });
    }

    renderList() {
        const url = this.props.match.url;
        if (this.state.view === ViewType.LOADING) return <div style={{ height: "280px" }}><Progressing pageLoader /></div>
        else if (this.state.view === ViewType.LOADING) return <Reload />
        else return <table className="security-policy-cluster__table">
            <tbody>
                <tr>
                    <td className="security-policy-cluster__title w-100">
                        <div className="dc__search-with-dropdown">
                            <Search className="icon-dim-20 ml-8" />
                            <input type="text" className="search-with-dropdown__search" onChange={this.handleSearchChange} autoFocus placeholder="Search cluster" />
                        </div>
                    </td>
                </tr>
                {this.state.clusterList.filter(cluster => cluster.name.includes(this.state.clusterSearch)).map((cluster, i) => {
                    return <tr key={cluster.id} className="security-policy-cluster__content-row">
                        <td className="pl-20 pr-20 pt-16 pb-16">
                            <NavLink to={`${url}/${cluster.id}`}>
                                {cluster.name}
                            </NavLink>
                        </td>
                    </tr>
                })}
            </tbody>
        </table>
    }

    renderContent() {
        if (this.props.match.params.clusterId) {
            return <SecurityPolicyEdit level="cluster" id={Number(`${this.props.match.params.clusterId}`)} key={`${this.props.match.params.clusterId}`} />
        }
        return <>
            <div className="ml-24 mr-24 mt-20 mb-20">
                <h1 className="form__title">Cluster Security Policies</h1>
                <p className="form__subtitle">Manage security policies for specific clusters. Global policies would be applicable if not denied</p>
            </div>
            <div className="white-card white-card--cluster">
                {this.renderList()}
            </div>
        </>
    }

    render() {
        return <>

            {this.renderContent()}
        </>
    }
}