import React, { useState, useEffect } from 'react'
import { ConfigurationType, ViewType } from '../../config'
import { RadioGroup, showError } from '../common'
import { ConditionContainerType, FormType, PluginVariableType } from '../ciPipeline/types'
import { VariableContainer } from './VariableContainer'
import { ConditionContainer } from './ConditionContainer'
import { getPluginDetail } from '../ciPipeline/ciPipeline.service'
import { ServerErrors } from '../../modals/commonTypes'

export function PluginDetailComponent({
    setPageState,
    selectedTaskIndex,
    formData,
    setFormData,
}: {
    setPageState: React.Dispatch<React.SetStateAction<string>>
    selectedTaskIndex: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
}) {
    const [configurationType, setConfigurationType] = useState<string>('GUI')
    useEffect(() => {
        const pluginData = {
            inputVariables: [
                {
                    id: 0,
                    name: 'Date',
                    value: 0,
                    format: 'string',
                    description: 'string',
                    defaultValue: '25',
                    RefVariableUsed: true,
                    RefVariableType: ['GLOBAL', 'FROM_PREVIOUS_STEP'],
                    RefVariableStepIndex: 0,
                    RefVariableName: 'string',
                },
                {
                    id: 1,
                    name: 'time',
                    value: 0,
                    format: 'number',
                    description: 'string',
                    defaultValue: '',
                    RefVariableUsed: true,
                    RefVariableType: ['GLOBAL', 'FROM_PREVIOUS_STEP'],
                    RefVariableStepIndex: 0,
                    RefVariableName: 'string',
                },
            ],
            outputVariables: [
                {
                    id: 0,
                    name: 'Date1',
                    value: 0,
                    format: 'string',
                    description: 'string',
                    defaultValue: '25',
                    RefVariableUsed: true,
                    RefVariableType: ['GLOBAL', 'FROM_PREVIOUS_STEP'],
                    RefVariableStepIndex: 0,
                    RefVariableName: 'string',
                },
                {
                    id: 1,
                    name: 'time1',
                    value: 0,
                    format: 'number',
                    description: 'string',
                    defaultValue: '',
                    RefVariableUsed: true,
                    RefVariableType: ['GLOBAL', 'FROM_PREVIOUS_STEP'],
                    RefVariableStepIndex: 0,
                    RefVariableName: 'string',
                },
            ],
        }
        processPluginData(pluginData)
        // setPageState(ViewType.LOADING)
        // getPluginDetail(formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.pluginId)
        //     .then((response) => {
        //         setPageState(ViewType.FORM)
        //     })
        //     .catch((error: ServerErrors) => {
        //         setPageState(ViewType.ERROR)
        //         showError(error)
        //     })
    }, [])

    const processPluginData = (pluginData) => {
        const _form = { ...formData }
        _form.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.outputVariables =
            !_form.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.outputVariables &&
            pluginData.outputVariables
        _form.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.inputVariables =
            !_form.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.inputVariables &&
            pluginData.inputVariables
        setFormData(_form)
    }

    return (
        <div className="p-20 ci-scrollable-content">
            <div>
                <div className="row-container mb-10">
                    <label className="fw-6 fs-13 cn-7 label-width">Task name*</label>{' '}
                    <input className="w-100" type="text" />
                </div>
                <div className="row-container mb-10">
                    <label className="fw-6 fs-13 cn-7 label-width">Configure task using</label>
                    <RadioGroup
                        className="configuration-container justify-start"
                        disabled={false}
                        initialTab={configurationType}
                        name="configuration-type"
                        onChange={(event) => {
                            setConfigurationType(event.target.value)
                        }}
                    >
                        <RadioGroup.Radio className="left-radius" value={ConfigurationType.GUI}>
                            {ConfigurationType.GUI}
                        </RadioGroup.Radio>
                        <RadioGroup.Radio className="right-radius" value={ConfigurationType.YAML}>
                            {ConfigurationType.YAML}
                        </RadioGroup.Radio>
                    </RadioGroup>
                </div>
            </div>
            <hr />
            <VariableContainer
                type={PluginVariableType.INPUT}
                selectedTaskIndex={selectedTaskIndex}
                formData={formData}
                setFormData={setFormData}
            />
            <hr />
            <ConditionContainer
                type={ConditionContainerType.TRIGGER_SKIP}
                selectedTaskIndex={selectedTaskIndex}
                formData={formData}
                setFormData={setFormData}
            />
            <hr />
            <VariableContainer
                type={PluginVariableType.OUTPUT}
                selectedTaskIndex={selectedTaskIndex}
                formData={formData}
                setFormData={setFormData}
            />
            <hr />
            <ConditionContainer
                type={ConditionContainerType.PASS_FAILURE}
                selectedTaskIndex={selectedTaskIndex}
                formData={formData}
                setFormData={setFormData}
            />
            <hr />
        </div>
    )
}
