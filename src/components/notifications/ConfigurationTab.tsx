import React, { Component } from 'react';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { SlackConfigModal } from './SlackConfigModal';
import { SESConfigModal } from './SESConfigModal';
import { ReactComponent as Edit } from '../../assets/icons/ic-edit.svg';
import { showError, Progressing } from '../common';
import { getSlackAndSESConfigs } from './notifications.service';
import slack from '../../assets/img/slack-logo.svg';
import ses from '../../assets/icons/ic-aws-ses.svg';
import { ViewType } from '../../config/constants';
import EmptyState from '../EmptyState/EmptyState';

export interface ConfigurationTabState {
    view: string;
    showSlackConfigModal: boolean;
    showSESConfigModal: boolean;
    slackConfigId: number;
    sesConfigId: number;
    sesConfigurationList: Array<{ id: number, name: string, accessKeyId: string, email: string, isDefault: boolean; }>;
    slackConfigurationList: Array<{ id: number, slackChannel: string; projectId: number; webhookUrl: string; }>;
    abortAPI: boolean;
}

export class ConfigurationTab extends Component<{}, ConfigurationTabState> {
    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            showSlackConfigModal: false,
            showSESConfigModal: false,
            slackConfigId: 0,
            sesConfigId: 0,
            sesConfigurationList: [],
            slackConfigurationList: [],
            abortAPI: false,
        }
        this.getAllChannelConfigs = this.getAllChannelConfigs.bind(this);
    }

    componentDidMount() {
        this.getAllChannelConfigs();
    }

    getAllChannelConfigs(): void {
        getSlackAndSESConfigs().then((response) => {
            let state = { ...this.state };
            state.slackConfigurationList = response.result.slackConfigurationList;
            state.sesConfigurationList = response.result.sesConfigurationList;
            state.view = ViewType.FORM;
            this.setState(state);
        }).catch((error) => {
            showError(error)
        })
    }

    renderSlackConfigurations() {
        return <div key="slack-config" className="white-card white-card--configuration-tab mb-16">
            <div className="configuration-tab__header">
                <p className="configuration-tab__title">
                    <img src={slack} alt="slack" className="icon-dim-24 mr-10" />
                    Slack Configurations
                </p>
                <button type="button" className="cta flex small" onClick={(event) => { this.setState({ showSlackConfigModal: true, slackConfigId: 0 }) }}>
                    <Add className="icon-dim-14 mr-5" />Add
                </button>
            </div>
            {this.renderSlackConfigurationTable()}
        </div>
    }

    renderSlackConfigurationTable() {
        if (this.state.view === ViewType.LOADING) {
            return <div className="flex" style={{ height: "calc(100% - 68px)" }}>
                <Progressing pageLoader />
            </div>
        }
        else if (this.state.slackConfigurationList.length === 0) {
            return <div style={{ height: "calc(100% - 70px)" }}>
                <EmptyState>
                    <EmptyState.Title><h3>No Configurations</h3></EmptyState.Title>
                </EmptyState>
            </div>
        }
        else return <table className="w-100">
            <thead>
                <tr className="configuration-tab__table-header">
                    <td className="slack-config-table__name truncate-text">Name</td>
                    <td className="slack-config-table__webhook truncate-text">Webhook URL</td>
                    <td className="slack-config-table__action"></td>
                </tr>
            </thead>
            <tbody>
                <tr className="mb-8">
                    {this.state.slackConfigurationList.map((slackConfig) => {
                        return <td key={slackConfig.id} className="configuration-tab__table-row">
                            <div className="slack-config-table__name truncate-text">{slackConfig.slackChannel}</div>
                            <div className="slack-config-table__webhook truncate-text">{slackConfig.webhookUrl}</div>
                            <div className="slack-config-table__action">
                                <button type="button" className="transparent align-right" onClick={(event) => {
                                    this.setState({ showSlackConfigModal: true, slackConfigId: slackConfig.id });
                                }}>
                                    <Edit className="icon-dim-20" />
                                </button>
                            </div>
                        </td>
                    })}
                </tr>
            </tbody>
        </table>
    }

    renderSESConfigurations() {
        return <div key="ses-config" className="white-card white-card--configuration-tab">
            <div className="configuration-tab__header">
                <p className="configuration-tab__title">
                    <img alt="ses config" src={ses} className="icon-dim-24 mr-10" />
                    SES Configurations
                </p>
                <button type="button" className="cta flex small" onClick={(event) => { this.setState({ showSESConfigModal: true, sesConfigId: 0 }) }}>
                    <Add className="icon-dim-14 mr-5" />Add
                </button>
            </div>
            {this.renderSESConfigurationTable()}
        </div>
    }

    renderSESConfigurationTable() {
        if (this.state.view === ViewType.LOADING) {
            return <div className="flex" style={{ height: "calc(100% - 68px)" }}>
                <Progressing pageLoader />
            </div>
        }
        else if (this.state.sesConfigurationList.length === 0) {
            return <div style={{ height: "calc(100% - 70px)" }}>
                <EmptyState>
                    <EmptyState.Title><h3>No Configurations</h3></EmptyState.Title>
                </EmptyState>
            </div>
        }
        else return <table className="w-100">
            <thead>
                <tr className="configuration-tab__table-header">
                    <th className="ses-config-table__name truncate-text">Name</th>
                    <th className="ses-config-table__access-key truncate-text">Access key Id</th>
                    <th className="ses-config-table__email truncate-text">Sender's Email</th>
                    <th className="ses-config-table__action"></th>
                </tr>
            </thead>
            <tbody>
                <tr className="mb-8">
                    {this.state.sesConfigurationList.map((sesConfig) => {
                        return <td key={sesConfig.id} className="configuration-tab__table-row">
                            <div className="ses-config-table__name truncate-text">{sesConfig.name}
                                {sesConfig.isDefault ? <span className="ses_config-table__tag">Default</span> : null}
                            </div>
                            <div className="ses-config-table__access-key truncate-text">{sesConfig.accessKeyId}</div>
                            <div className="ses-config-table__email truncate-text">{sesConfig.email}</div>
                            <div className="ses-config-table__action">
                                <button type="button" className="transparent align-right" onClick={(event) => {
                                    this.setState({ showSESConfigModal: true, sesConfigId: sesConfig.id });
                                }}>
                                    <Edit className="icon-dim-20" />
                                </button>
                            </div>
                        </td>
                    })}
                </tr>
            </tbody>
        </table>
    }

    renderSESConfigModal() {
        if (this.state.showSESConfigModal) {
            return <SESConfigModal sesConfigId={this.state.sesConfigId}
                shouldBeDefault={this.state.sesConfigurationList.length === 0}
                onSaveSuccess={() => {
                    this.setState({ showSESConfigModal: false, sesConfigId: 0 });
                    this.getAllChannelConfigs();
                }}
                closeSESConfigModal={(event) => { this.setState({ showSESConfigModal: false }); }}
            />
        }
    }

    renderSlackConfigModal() {
        if (this.state.showSlackConfigModal) {
            return <SlackConfigModal slackConfigId={this.state.slackConfigId}
                onSaveSuccess={() => {
                    this.setState({ showSlackConfigModal: false, slackConfigId: 0 });
                    this.getAllChannelConfigs();
                }}
                closeSlackConfigModal={(event) => { this.setState({ showSlackConfigModal: false, slackConfigId: 0 }); }}
            />
        }
    }

    render() {
        return <>
            <div className="configuration-tab">
                {this.renderSESConfigurations()}
                {this.renderSlackConfigurations()}
            </div>
            {this.renderSESConfigModal()}
            {this.renderSlackConfigModal()}
        </>
    }
}