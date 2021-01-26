import React, { Component } from 'react';
import { Select } from '../../common';
import { ChartValuesType } from './../charts.types';
import { getChartValuesFiltered } from './../charts.helper';
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg';

export interface ChartValuesSelectProps {
    redirectToChartValues: (...args) => void;
    onChange: (...args) => void;
    tabIndex?: number;
    chartValues: ChartValuesType;
    chartValuesList: ChartValuesType[];
}

export class ChartValuesSelect extends Component<ChartValuesSelectProps> {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.selectionComparator = this.selectionComparator.bind(this);
    }

    onChange(event) {
        let chartValue = event.target.value;
        this.props.onChange(chartValue);
    }

    selectionComparator(value: ChartValuesType): boolean {
        return (this.props.chartValues.id === value.id && this.props.chartValues.kind === value.kind)
    }

    renderNoResultsOption() {
        return <div className="select__option-with-subtitle select__option-with-subtitle--empty-state">
            <div className="select__check-icon"></div>
            No Results
        </div>
    }

    render() {
        let chartValuesList = this.props.chartValuesList;
        let chartValues = getChartValuesFiltered(this.props.chartValuesList);
        let selectedChartValue = chartValuesList.find(chartValue => this.props.chartValues.id === chartValue.id && chartValue.kind === this.props.chartValues.kind);
        let label = "Select Chart Value";
        if (selectedChartValue) {
            label = `${selectedChartValue.name} (${selectedChartValue.chartVersion})`
        }
        return <>
            <Select tabIndex={this.props.tabIndex || 0}
                rootClassName="select-button--default"
                valueComparator={this.selectionComparator}
                value={this.props.chartValues}
                onChange={this.onChange}>
                <Select.Button>{label}</Select.Button>
                <Select.OptGroup label="DEPLOYED" key={"DEPLOYED"}>
                    {chartValues.deployedChartValues.length ? chartValues.deployedChartValues.map((chartValue) => {
                        let env = chartValue.environmentName || "";
                        return <Select.Option key={chartValue.id} value={chartValue}>
                            <div>{chartValue.name} ({chartValue.chartVersion})
                                <div className="option-with-subtitle__subtitle">
                                    Deployed on:{`${env}`}
                                </div>
                            </div>
                        </Select.Option>
                    }) : this.renderNoResultsOption()}
                </Select.OptGroup>
                <Select.OptGroup label="SAVED" key={"SAVED"}>
                    {chartValues.savedChartValues.length ? chartValues.savedChartValues.map((chartValue) => {
                        return <Select.Option key={chartValue.id} value={chartValue}>
                            {chartValue.name} ({chartValue.chartVersion})
                    </Select.Option>
                    }) : this.renderNoResultsOption()}
                </Select.OptGroup>
                <Select.OptGroup label="EXISTING" key={"EXISTING"}>
                    {chartValues.existingChartValues.length ? chartValues.existingChartValues.map((chartValue) => {
                        return <Select.Option key={chartValue.id} value={chartValue}>
                            {chartValue.name} ({chartValue.chartVersion})
                    </Select.Option>
                    }) : this.renderNoResultsOption()}
                </Select.OptGroup>
                <Select.OptGroup label="DEFAULT" key={"DEFAULT"}>
                    {chartValues.defaultChartValues.length ? chartValues.defaultChartValues.map((chartValue) => {
                        return <Select.Option key={chartValue.id} value={chartValue}>
                            {chartValue.name} ({chartValue.chartVersion})
                 </Select.Option>
                    }) : this.renderNoResultsOption()}
                </Select.OptGroup>
                <div className="select__sticky-bottom" onClick={this.props.redirectToChartValues}>
                    <Add className="icon-dim-20 mr-5" />
                    Create Custom
                </div>
            </Select>
        </>
    }
}