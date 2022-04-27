import React, { useContext, useState } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Equal } from '../../assets/icons/ic-variable-equal.svg'
import {
    FormType,
    PluginVariableType,
    RefVariableType,
    TaskFieldDescription,
    VariableFieldType,
    VariableType,
} from '../ciPipeline/types'
import CustomInputVariableSelect from './CustomInputVariableSelect'
import { ciPipelineContext } from './CIPipeline'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import ReactSelect from 'react-select'
import { tempMultiSelectStyles } from './ciPipeline.utils'
import Tippy from '@tippyjs/react'
import { Option } from '../v2/common/ReactSelect.utils'

function CustomInputOutputVariables({ type }: { type: PluginVariableType }) {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        calculateLastStepDetail,
        formDataErrorObj,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        selectedTaskIndex: number
        activeStageName: string
        calculateLastStepDetail: (
            isFromAddNewTask: boolean,
            _formData: FormType,
            activeStageName: string,
            startIndex?: number,
        ) => {
            index: number
            calculatedStageVariables: Map<string, VariableType>[]
        }
        formDataErrorObj: object
    } = useContext(ciPipelineContext)
    const formatOptions: { label: string; value: string }[] = ['STRING', 'BOOL', 'NUMBER', 'DATE'].map((format) => ({
        label: format,
        value: format,
    }))
    const addVariable = (): void => {
        const _formData = { ...formData }
        const id =
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]]?.reduce(
                (prev, current) => (prev.id > current.id ? prev : current),
                {
                    id: 0,
                },
            ).id + 1
        const newCondition = {
            id: id,
            name: '',
            value: '',
            format: formatOptions[0].label,
            description: '',
            defaultValue: '',
            refVariableUsed: false,
            variableType: RefVariableType.NEW,
            refVariableStepIndex: 0,
            refVariableName: '',
        }
        if (!_formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]]) {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]] = []
        }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]].push(newCondition)
        setFormData(_formData)
    }

    const handleInputOutputValueChange = (e, index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]][index][
            e.target.name
        ] = e.target.value
        setFormData(_formData)
    }

    const handleBlur = () => {
        if (type === PluginVariableType.OUTPUT) {
            const _formData = { ...formData }
            calculateLastStepDetail(false, _formData, activeStageName, selectedTaskIndex)
            setFormData(_formData)
        }
    }

    const deleteInputOutputValue = (index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]].splice(index, 1)
        if (type === PluginVariableType.OUTPUT) {
            calculateLastStepDetail(false, _formData, activeStageName, selectedTaskIndex)
        }
        setFormData(_formData)
    }

    const handleFormatChange = (selectedValue: { label: string; value: string }, index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]][index].format =
            selectedValue.label
        if (type === PluginVariableType.OUTPUT) {
            calculateLastStepDetail(false, _formData, activeStageName, selectedTaskIndex)
        }
        setFormData(_formData)
    }

    return (
        <>
            <div className="row-container mb-8">
                <Tippy
                    className="default-tt"
                    arrow={false}
                    content={
                        <span style={{ display: 'block', width: '220px' }}>
                            {type === PluginVariableType.INPUT
                                ? TaskFieldDescription.INPUT
                                : TaskFieldDescription.OUTPUT}
                        </span>
                    }
                >
                    <div className={`tp-4 fs-13 fw-6 text-capitalize mr-8 lh-32`}>
                        <span className={` ${type === PluginVariableType.INPUT ? 'text-underline-dashed' : ''}`}>
                            {type} variables{' '}
                        </span>
                    </div>
                </Tippy>

                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32" onClick={addVariable}>
                    <Add className="add-icon mt-6" />
                    Add variable
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]]?.map(
                (variable, index) => (
                    <div key={`custom-input-variable${index}`}>
                        <div className="pl-220 mb-8 flexbox justify-space">
                            <div className="custom-variable-container w-100">
                                <Equal className="icon-dim-40 variable-equal-icon" />

                                <div className="tp-4 fs-12 fw-4">
                                    <div className="flexbox">
                                        <div
                                            style={{
                                                width: type === PluginVariableType.OUTPUT ? '80%' : '100%',
                                            }}
                                        >
                                            <input
                                                className={`w-100 bcn-1 en-2 bw-1 pl-10 pr-10 pt-4 pb-4 h-32 ${
                                                    type === PluginVariableType.INPUT
                                                        ? 'top-radius-4 border-bottom'
                                                        : 'no-bottom-border top-left-radius'
                                                }`}
                                                type="text"
                                                placeholder="Variable name"
                                                value={variable.name}
                                                autoComplete="off"
                                                name="name"
                                                onChange={(e) => handleInputOutputValueChange(e, index)}
                                                onBlur={(e) => handleBlur()}
                                            />
                                        </div>

                                        {type === PluginVariableType.OUTPUT && (
                                            <div
                                                style={{
                                                    width: '20%',
                                                    borderTopRightRadius: '4px',
                                                }}
                                                className="border-right border-top"
                                            >
                                                <ReactSelect
                                                    value={
                                                        variable.format
                                                            ? { label: variable.format, value: variable.format }
                                                            : formatOptions[0]
                                                    }
                                                    tabIndex={1}
                                                    onChange={(selectedValue) => {
                                                        handleFormatChange(selectedValue, index)
                                                    }}
                                                    options={formatOptions}
                                                    isSearchable={false}
                                                    components={{
                                                        IndicatorSeparator: null,
                                                        Option,
                                                    }}
                                                    styles={{
                                                        ...tempMultiSelectStyles,
                                                        control: (base, state) => ({
                                                            ...base,
                                                            border: 'none !important',
                                                            boxShadow: 'none',
                                                            minHeight: 'auto',
                                                            borderRadius: 'none',
                                                            height: '3px',
                                                            borderTopRightRadius: '4px',
                                                            fontSize: '12px',
                                                        }),
                                                        valueContainer: (base, state) => ({
                                                            ...base,
                                                            color: 'var(--N900)',
                                                            background: 'var(--N100) !important',
                                                            padding: '0px 10px',
                                                            display: 'flex',
                                                            height: '31px',
                                                            fontSize: '12px',
                                                        }),
                                                        indicatorsContainer: (base, state) => ({
                                                            ...base,
                                                            background: 'var(--N100) !important',
                                                            borderTopRightRadius: '4px',
                                                        }),
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>{' '}
                                </div>
                                {type === PluginVariableType.INPUT && (
                                    <div className="flexbox">
                                        <div className="border-left" style={{ width: '80%' }}>
                                            <CustomInputVariableSelect selectedVariableIndex={index} />
                                        </div>
                                        <div
                                            style={{
                                                width: '20%',
                                                borderRight: '1px solid var(--N200)',
                                                borderLeft: '1px solid var(--N200)',
                                            }}
                                            className="bcn-1"
                                        >
                                            {variable.format ? (
                                                <span className="fs-12 fw-4 pl-12 pr-12 pt-5 pb-4 flex left">
                                                    {variable.format}
                                                </span>
                                            ) : (
                                                <ReactSelect
                                                    value={
                                                        variable.format
                                                            ? { label: variable.format, value: variable.format }
                                                            : formatOptions[0]
                                                    }
                                                    tabIndex={2}
                                                    onChange={(selectedValue) => {
                                                        handleFormatChange(selectedValue, index)
                                                    }}
                                                    options={formatOptions}
                                                    isSearchable={false}
                                                    components={{
                                                        IndicatorSeparator: null,
                                                        Option,
                                                    }}
                                                    name="format"
                                                    styles={{
                                                        ...tempMultiSelectStyles,
                                                        valueContainer: (base, state) => ({
                                                            ...base,
                                                            color: 'var(--N900)',
                                                            background: 'var(--N100) !important',
                                                            padding: '0px 10px',
                                                            display: 'flex',
                                                            height: '32px',
                                                            fontSize: '12px',
                                                        }),
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                                <input
                                    style={{ width: '80% !important' }}
                                    className="w-100 bcn-1 en-2 bw-1 pl-10 pr-10 pt-6 pb-6 bottom-radius-4 h-32"
                                    autoComplete="off"
                                    placeholder="Description"
                                    type="text"
                                    value={variable.description}
                                    name="description"
                                    onChange={(e) => handleInputOutputValueChange(e, index)}
                                    onBlur={(e) => handleBlur()}
                                />
                            </div>

                            <Close
                                className="icon-dim-24 pointer mt-6 ml-6"
                                onClick={() => {
                                    deleteInputOutputValue(index)
                                }}
                            />
                        </div>
                        {formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.inlineStepDetail[
                            VariableFieldType[type]
                        ][index] &&
                            !formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.inlineStepDetail[
                                VariableFieldType[type]
                            ][index].isValid && (
                                <div className="pl-220 mb-20">
                                    <span className="flexbox cr-5 mb-4 mt-4 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                        <span>
                                            {
                                                formDataErrorObj[activeStageName].steps[selectedTaskIndex]
                                                    ?.inlineStepDetail[VariableFieldType[type]][index].message
                                            }
                                        </span>
                                    </span>
                                </div>
                            )}
                    </div>
                ),
            )}
        </>
    )
}

export default CustomInputOutputVariables
