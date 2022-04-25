import React, { useState, useContext } from 'react'
import CodeEditor from '../CodeEditor/CodeEditor'
import { FormType, MountPath, ScriptType, TaskFieldDescription, TaskFieldLabel } from '../ciPipeline/types'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import OutputDirectoryPath from './OutputDirectoryPath'
import MultiplePort from './MultiplsPort'
import { ciPipelineContext } from './CIPipeline'
import Tippy from '@tippyjs/react'
import TaskFieldTippyDescription from './TaskFieldTippyDescription'
import MountFromHost from './MountFromHost'
import { Checkbox, CHECKBOX_VALUE } from '../common'
import CustomScript from './CustomScript'

export function TaskTypeDetailComponent({ taskScriptType }: { taskScriptType: string }) {
    const {
        selectedTaskIndex,
        formData,
        setFormData,
        activeStageName,
    }: {
        selectedTaskIndex: number
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        activeStageName: string
    } = useContext(ciPipelineContext)
    const [isMountCustomScript, setIsMountCustomScript] = useState(false)

    const handleContainer = (e: any, key: 'containerImagePath' | 'imagePullSecret'): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = e.target.value
        setFormData(_formData)
    }

    const handleCustomChange = (event, key: 'script' | 'storeScriptAt' | 'mountCodeToContainerPath') => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = event.target.value
        setFormData(_formData)
    }

    const handleMountChange = (e, key: 'mountCodeToContainer' | 'mountDirectoryFromHost') => {
        const _formData = { ...formData }
        console.log(e.target.value)
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] =
            e.target.value === MountPath.TRUE ? true : false
        setFormData(_formData)
    }

    const handleCommandArgs = (e, key: 'command' | 'args') => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap[0][key] =
            key === 'command' ? e.target.value : e.target.value.replace(/\s+/g, '').split(',')
        setFormData(_formData)
    }

    const renderShellScript = () => {
        if (taskScriptType === ScriptType.SHELL) {
            return (
                <>
                    <CustomScript
                        formData={formData}
                        handleScriptChange={(e) => handleCustomChange(e, 'script')}
                        activeStageName={activeStageName}
                        selectedTaskIndex={selectedTaskIndex}
                    />
                    <hr />
                    <OutputDirectoryPath />
                </>
            )
        }
    }

    const renderContainerScript = () => {
        if (taskScriptType === ScriptType.CONTAINERIMAGE) {
            return (
                <>
                    <div className="row-container mb-10">
                        <TaskFieldTippyDescription
                            taskField={TaskFieldLabel.CONTAINERIMAGEPATH}
                            contentDescription={TaskFieldDescription.CONTAINERIMAGEPATH}
                        />
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder="Enter image path *"
                            type="text"
                            onChange={(e) => handleContainer(e, 'containerImagePath')}
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.containerImagePath
                            }
                        />
                    </div>
                    <div className="flex left pl-200 fs-13 fw-6 pb-18 pt-9 ">
                        <Checkbox
                            isChecked={isMountCustomScript}
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                            rootClassName="top"
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={(e) => setIsMountCustomScript(!isMountCustomScript)}
                        >
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                content="Enable this if you also want to mount scripts in the container"
                            >
                                <label>Mount custom script</label>
                            </Tippy>
                        </Checkbox>
                    </div>
                    {isMountCustomScript && (
                        <>
                            <CustomScript
                                formData={formData}
                                handleScriptChange={(e) => handleCustomChange(e, 'script')}
                                activeStageName={activeStageName}
                                selectedTaskIndex={selectedTaskIndex}
                            />
                            <div className="row-container mb-10">
                                <TaskFieldTippyDescription
                                    taskField={TaskFieldLabel.STORESCRIPTAT}
                                />
                                <input
                                    style={{ width: '80% !important' }}
                                    className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                                    autoComplete="off"
                                    placeholder="Eg. directory/filename"
                                    type="text"
                                    name='storeScriptAt'
                                    onChange={(e) => handleCustomChange(e, 'storeScriptAt')}
                                    value={
                                        formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.storeScriptAt
                                    }
                                />
                            </div>
                        </>
                    )}
                    <div className="row-container mb-10">
                        <TaskFieldTippyDescription
                            taskField={TaskFieldLabel.COMMAND}
                            contentDescription={TaskFieldDescription.COMMAND}
                        />
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder="Eg. “echo”"
                            type="text"
                            onChange={(e) => handleCommandArgs(e, TaskFieldLabel.COMMAND)}
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap[0][
                                    TaskFieldLabel.COMMAND
                                ]
                            }
                        />
                    </div>
                    <div className="row-container mb-10">
                        <TaskFieldTippyDescription
                            taskField={TaskFieldLabel.ARGS}
                            contentDescription={TaskFieldDescription.ARGS}
                        />
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder='Eg. "HOSTNAME", "KUBERNETES_PORT"'
                            type="text"
                            onChange={(e) => handleCommandArgs(e, 'args')}
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap[0][
                                    'args'
                                ]
                            }
                        />
                    </div>
                    <MultiplePort />
                    <div className="row-container mb-10">
                        <TaskFieldTippyDescription
                            taskField={TaskFieldLabel.MOUNTCODETOCONTAINER}
                            contentDescription={TaskFieldDescription.MOUNTCODETOCONTAINER}
                        />
                        <RadioGroup
                            className="no-border"
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountCodeToContainer
                                    ? MountPath.TRUE
                                    : MountPath.FALSE
                            }
                            disabled={false}
                            name="mountCodeToContainer"
                            onChange={(event) => {
                                handleMountChange(event, 'mountCodeToContainer')
                            }}
                        >
                            <RadioGroupItem value={MountPath.FALSE}> {MountPath.FALSE} </RadioGroupItem>
                            <RadioGroupItem value={MountPath.TRUE}> {MountPath.TRUE} </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountCodeToContainer ===
                        true && (
                        <div className="row-container mb-10">
                            <label className="fw-6 fs-13 cn-7 label-width"></label>
                            <input
                                style={{ width: '80% !important' }}
                                className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                                autoComplete="off"
                                placeholder="Eg file/folder"
                                type="text"
                                onChange={(e) => handleCustomChange(e, 'mountCodeToContainerPath')}
                                value={formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountCodeToContainerPath}
                            />
                        </div>
                    )}
                    <div className="row-container mb-10">
                        <TaskFieldTippyDescription
                            taskField={TaskFieldLabel.MOUNTDIRECTORYFROMHOST}
                            contentDescription={TaskFieldDescription.MOUNTDIRECTORYFROMHOST}
                        />
                        <RadioGroup
                            className="no-border"
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountDirectoryFromHost ? MountPath.TRUE : MountPath.FALSE
                            }
                            disabled={false}
                            name="mountDirectoryFromHost"
                            onChange={(event) => {
                                handleMountChange(event, 'mountDirectoryFromHost')
                            }}
                        >
                            <RadioGroupItem value={MountPath.FALSE}> {MountPath.FALSE} </RadioGroupItem>
                            <RadioGroupItem value={MountPath.TRUE}> {MountPath.TRUE} </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountDirectoryFromHost ===
                        true && (
                        <MountFromHost
                            formData={formData}
                            activeStageName={activeStageName}
                            selectedTaskIndex={selectedTaskIndex}
                            setFormData={setFormData}
                        />
                    )}
                    <OutputDirectoryPath />
                </>
            )
        }
    }

    const renderDockerScript = () => {
        if (taskScriptType === ScriptType.DOCKERFILE) {
            return (
                <>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Docker path *</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Enter Mount script path"
                            type="text"
                        />
                    </div>
                    <div className="row-container mb-10">
                        <Tippy className="default-tt" arrow={false} content="Path where script should be mounted">
                            <label className="fw-6 fs-13 cn-7 label-width">Mount script at *</label>
                        </Tippy>
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Enter Mount script path"
                            type="text"
                        />
                    </div>
                </>
            )
        }
    }

    return (
        <>
            {renderShellScript()}
            {renderContainerScript()}
            {/* {renderDockerScript()} */}
        </>
    )
}
