import React, { useState, useEffect } from 'react';
import { getGitHostList, getGitProviderList } from '../../services/service';
import { saveGitHost, saveGitProviderConfig, updateGitProviderConfig } from './gitProvider.service'
import { showError, useForm, useEffectAfterMount, useAsync, Progressing, ErrorScreenManager } from '../common'
import { List, CustomInput, ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { toast } from 'react-toastify'
import { DOCUMENTATION } from '../../config';
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../assets/icons/git/bitbucket.svg'
import { DropdownIndicator, Option } from './gitProvider.util';
import Tippy from '@tippyjs/react';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import ReactSelect, { components } from 'react-select';
import { multiSelectStyles, VisibleModal } from '../common';
import './gitProvider.css'
import { GitHostConfigModal } from './AddGitHostConfigModal';

export default function GitProvider({ ...props }) {
    const [loading, result, error, reload] = useAsync(getGitProviderList)
    const [providerList, setProviderList] = useState([])
    const [hostListOption, setHostListOption] = useState([])
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [isErrorLoading, setIsErrorLoading] = useState(false)
    const [errors, setErrors] = useState([])
    const [showGitProviderConfigModal, setGitProviderConfigModal] = useState(false)
    // const [collapsed, toggleCollapse] = useState(true);
    async function getInitData() {
        try {
            const { result: providers = [] } = await getGitProviderList()
            const { result: hosts = [] } = await getGitHostList()
            providers.sort((a, b) => a.name.localeCompare(b.name))
            hosts.sort((a, b) => a.name.localeCompare(b.name))
            let hostOptions = hosts.map(host => {
                return {
                    value: host.id,
                    label: host.name
                }
            })
            setProviderList(providers)
            setHostListOption(hostOptions)
        } catch (error) {
            showError(error)
            setErrors(error)
            setIsErrorLoading(true)
        } finally {
            setIsPageLoading(false)
        }
    }

    async function getHostList() {
        try {
            const { result: hosts = [] } = await getGitHostList();
            hosts.sort((a, b) => a.name.localeCompare(b.name))
            let host = hosts.map(host => {
                return {
                    value: host.id,
                    label: host.name
                }
            })
            setHostListOption(host)
        } catch (error) {
            showError(error)
            setIsErrorLoading(true)
        }
    }

    async function getProviderList() {
        try {
            const { result: providers = [] } = await getGitProviderList();
            providers.sort((a, b) => a.name.localeCompare(b.name))
            setProviderList(providers)
        } catch (error) {
            showError(error)
            setIsErrorLoading(true)
        }
    }

    useEffect(() => {
        getInitData();

    }, [])

    if (isPageLoading) {
        return <Progressing pageLoader />
    }
    if (isErrorLoading) {
        return <ErrorScreenManager code={error?.code} />
    }

    let allProviders = [{ id: null, name: "", active: true, url: "", gitHostId: "", authMode: "ANONYMOUS", userName: "", password: "" }].concat(providerList);

    return (
        <section className="mt-16 mb-16 ml-20 mr-20 global-configuration__component flex-1">
            <h2 className="form__title">Git accounts</h2>
            <div className="form__subtitle">Manage your organization’s git accounts. &nbsp;
                <a className="learn-more__href" href={DOCUMENTATION.GLOBAL_CONFIG_GIT} rel="noopener noreferrer" target="_blank">
                    Learn more about git accounts
                </a>
            </div>
            {allProviders.map((provider) => {
                return <> <CollapsedList key={provider.name || Math.random().toString(36).substr(2, 5)}
                    id={provider.id}
                    name={provider.name}
                    showGitProviderConfigModal={showGitProviderConfigModal}
                    setGitProviderConfigModal={setGitProviderConfigModal}
                    providerList={providerList}
                    hostListOption={hostListOption}
                    gitHostId={provider.gitHostId}
                    active={provider.active}
                    url={provider.url}
                    authMode={provider.authMode}
                    userName={provider.userName}
                    password={provider.password}
                    getHostList={getHostList}
                    getProviderList={getProviderList}
                    reload={getInitData}
                />

                    {showGitProviderConfigModal &&
                        <VisibleModal className="app-status__material-modal">
                            <GitHostConfigModal
                                closeGitConfigModal={() => setGitProviderConfigModal(false)}
                                getHostList={getHostList}
                            />
                        </VisibleModal>}
                </>
            })}
            {/* {[{ id: null, name: "", active: true, url: "", authMode: "ANONYMOUS" }].concat(result && Array.isArray(result.result) ? result.result : []).sort((a, b) => a.name.localeCompare(b.name)).map(git => <CollapsedList {...git} key={git.id || Math.random().toString(36).substr(2, 5)} reload={reload} />)} */}
        </section>
    )
}

function CollapsedList({ id, name, active, url, authMode, gitHostId, accessToken = "", userName = "", password = "", reload, hostListOption, getHostList, getProviderList, providerList, showGitProviderConfigModal, setGitProviderConfigModal, ...props }) {
    const [collapsed, toggleCollapse] = useState(true);
    const [enabled, toggleEnabled] = useState(active);
    const [loading, setLoading] = useState(false);
    let selectedGitHost = hostListOption.find((p) => p.value === gitHostId)
    const [gitHost, setGithost] = useState({ value: selectedGitHost, error: '' })
    useEffectAfterMount(() => {
        if (!collapsed) return
        async function update() {
            let payload = {
                id: id || 0, name, url, authMode, active: enabled, gitHostId,
                ...(authMode === 'USERNAME_PASSWORD' ? { username: userName, password } : {}),
                ...(authMode === 'ACCESS_TOKEN' ? { accessToken } : {})
            }
            try {
                setLoading(true);
                await updateGitProviderConfig(payload, id);
                await reload();
                toast.success(`Git account ${enabled ? 'enabled' : 'disabled'}.`)
            } catch (err) {
                showError(err);
            } finally {
                setLoading(false);
            }
        }
        update()
    }, [enabled])

    return (
        <article className={`collapsed-list ${id ? 'collapsed-list--chart' : 'collapsed-list--git'} collapsed-list--${id ? 'update' : 'create'}`}>
            <List onClick={e => toggleCollapse(t => !t)}>
                <List.Logo>{id ? <div className="">
                    <span className="mr-8">
                        {url.includes("gitlab") ? <GitLab /> : null}
                        {url.includes("github") ? <GitHub /> : null}
                        {url.includes("bitbucket") ? <BitBucket /> : null}
                        {url.includes("gitlab") || url.includes("github") || url.includes("bitbucket") ? null : <Git />}
                    </span></div> :
                    <div className="add-icon" />}</List.Logo>
                <div className="flex left">
                    <List.Title title={id && !collapsed ? 'Edit git account' : name || "Add git account"} subtitle={collapsed ? url : null} />
                    {id &&
                        <Tippy className="default-tt" arrow={false} placement="bottom" content={enabled ? 'Disable git account' : 'Enable git account'}>
                            <span style={{ marginLeft: 'auto' }}>
                                {loading ? <Progressing />
                                    : <List.Toggle onSelect={(en) => toggleEnabled(en)} enabled={enabled} />}
                            </span>
                        </Tippy>
                    }
                </div>
                {id && <List.DropDown onClick={e => { e.stopPropagation(); toggleCollapse(t => !t) }} className="rotate" style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }} />}
            </List>
            {!collapsed && <GitForm {...{ id, name, active, url, authMode, gitHostId, accessToken, userName, password, hostListOption, getHostList, getProviderList, reload, providerList, toggleCollapse, showGitProviderConfigModal, setGitProviderConfigModal, gitHost, setGithost }} />}

        </article>
    )
}


function GitForm({ id = null, name = "", active = false, url = "", gitHostId, authMode = null, accessToken = "", userName = "", password = "", hostListOption, hostName = undefined, reload, toggleCollapse, getHostList, getProviderList, providerList, showGitProviderConfigModal, setGitProviderConfigModal, gitHost, setGithost, ...props }) {
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            name: { value: name, error: "" },
            url: { value: url, error: "" },
            auth: { value: authMode, error: "" },
        },
        {
            name: {
                required: true,
                validator: { error: 'Name is required', regex: /^.{5,}$/ }
            },
            url: {
                required: true,
                validator: { error: 'URL is required', regex: /^.{10,}$/ }
            },
            auth: {
                required: true,
                validator: { error: 'Mode is required', regex: /^.*$/ },
            },
        }, onValidation);

    const [loading, setLoading] = useState(false)
    const [customState, setCustomState] = useState({ password: { value: password, error: '' }, username: { value: userName, error: '' }, accessToken: { value: accessToken, error: '' }, hostName: { value: gitHost.value, error: '' } })
    const customHandleChange = e => setCustomState(state => ({ ...state, [e.target.name]: { value: e.target.value, error: "" } }))

    function handleGithostChange(host) {
        setGithost({
            value: host,
            error: host ? "" : "Required"
        })
    }

    async function onValidation() {


        if (state.auth.value === 'USERNAME_PASSWORD') {
            if (!customState.password.value || !customState.username.value) {
                setCustomState(state => ({ ...state, password: { value: state.password.value, error: 'Required' }, username: { value: state.username.value, error: 'Required' } }))
                return
            }
        }
        else if (state.auth.value === "ACCESS_TOKEN") {
            if (!customState.accessToken.value) {
                setCustomState(state => ({ ...state, accessToken: { value: '', error: 'Required' } }))
                return
            }
        }

        if (!gitHost.value) {
            setGithost({
                ...gitHost,
                error: "This is a required field"
            })
            return
        }

        if (gitHost.value && gitHost.value.__isNew__) {
            let gitHostPayload = {
                name: gitHost.value.value,
                active: true
            }
            try {
                let gitHostId = gitHost.value.value;
                const { result } = await saveGitHost(gitHostPayload);
                await getHostList();

                gitHostId = result;
            } catch (error) {
                showError(error)
            }
        }
        let payload = {
            id: id || 0,
            name: state.name.value,
            gitHostId: gitHost.value.value,
            url: state.url.value,
            authMode: state.auth.value,
            active,
            ...(state.auth.value === 'USERNAME_PASSWORD' ? { username: customState.username.value, password: customState.password.value } : {}),
            ...(state.auth.value === 'ACCESS_TOKEN' ? { accessToken: customState.accessToken.value } : {})
        }

        const api = id ? updateGitProviderConfig : saveGitProviderConfig
        try {
            setLoading(true)
            await api(payload, id);
            reload();
            toast.success('Successfully saved.')
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(false);
        }
    }

    const MenuList = (props) => {
        const isNew = props.options.map((p) => p.label)
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="flex left pl-10 pt-8 pb-8 cb-5 cursor bcn-0 react-select__bottom border-top " onClick={(selected) => { setGitProviderConfigModal(true); toggleCollapse(false) }}>
                    <Add className="icon-dim-20 mr-5 fs-14 fcb-5 mr-12 vertical-align-bottom " />  Add Git Host
               </div>
            </components.MenuList>
        );
    };

    return (
        <>
            <form onSubmit={handleOnSubmit} className="git-form" autoComplete="off">
                <div className="mb-16">
                    <CustomInput autoComplete="off" value={state.name.value} onChange={handleOnChange} name="name" error={state.name.error} label="Name*" />
                </div>
                <div className="form__row form__row--two-third">
                    <div>
                        <div>
                            <label className="form__label">Git host*</label>
                            <ReactSelect
                                name="host"
                                value={gitHost.value}
                                className="react-select--height-44 fs-13 bcn-0"
                                placeholder="Select git host"
                                isMulti={false}
                                isSearchable
                                isClearable={false}
                                options={hostListOption}
                                styles={{
                                    ...multiSelectStyles,
                                    menuList: (base) => {
                                        return {
                                            ...base,
                                            position: 'relative',
                                            paddingBottom: '0px',
                                            maxHeight: '176px',
                                        }
                                    }
                                }}
                                components={{
                                    IndicatorSeparator: null,
                                    DropdownIndicator,
                                    MenuList,
                                    Option
                                }}
                                onChange={(e) => handleGithostChange(e)}
                                isDisabled={gitHostId}
                            />
                        </div>

                        <div className="cr-5 fs-11">{gitHost.error}</div>
                    </div>
                    <CustomInput autoComplete="off" value={state.url.value} onChange={handleOnChange} name="url" error={state.url.error} label="URL*" />
                </div>
                <div className="form__label">Authentication type*</div>
                <div className="form__row form__row--auth-type pointer">
                    {[{ label: 'User auth', value: 'USERNAME_PASSWORD' },{ label: 'Anonymous', value: 'ANONYMOUS' },]
                        .map(({ label: Lable, value }) => <label key={value} className="flex left pointer">
                            <input type="radio" name="auth" value={value} onChange={handleOnChange} checked={value === state.auth.value} /> {Lable}
                        </label>)}

                </div>
                {state.auth.error && <div className="form__error">{state.auth.error}</div>}
                {state.auth.value === 'USERNAME_PASSWORD' && <div className="form__row form__row--two-third">
                    <CustomInput value={customState.username.value} onChange={customHandleChange} name="username" error={customState.username.error} label="Username*" />
                    <ProtectedInput value={customState.password.value} onChange={customHandleChange} name="password" error={customState.password.error} label="Password/Auth token*" />
                </div>}
                {/* {state.auth.value === "ACCESS_TOKEN" && <div className="form__row">
                    <ProtectedInput value={customState.accessToken.value} onChange={customHandleChange} name="accessToken" error={customState.accessToken.error} label="Access token*" />
                </div>} */}
                <div className="form__row form__buttons">
                    <button className="cta cancel" type="button" onClick={e => toggleCollapse(t => !t)}>Cancel</button>
                    <button className="cta" type="submit" disabled={loading}>{loading ? <Progressing /> : id ? 'Update' : 'Save'}</button>
                </div>
            </form>
        </>
    )
}

