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
import { styles, DropdownIndicator } from './gitProvider.util';
import Tippy from '@tippyjs/react';
import ReactSelect, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';
interface Githost {
    id: number;
    name: string;
    active: boolean;
    eventTypeHeader: string;
    secretHeader: string;
    webhookSecret: string;
    webhookUrl: string;
}


export default function GitProvider({ ...props }) {
    const [loading, result, error, reload] = useAsync(getGitProviderList)
    const [providerList, setProviderList] = useState([])
    const [hostList, setHostList] = useState([])
    const [hostListOption, setHostListOption] = useState([])
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [isErrorLoading, setIsErrorLoading] = useState(false)
    const [errors, setErrors] = useState([])

    async function getInitData() {
        try {
            getProviderList()
            getHostList()
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
            setHostList(hosts)
            let hostOptions = hosts.map(host => {
                return {
                    value: host.id,
                    label: host.name
                }
            })
            setHostListOption(hostOptions)

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

    // if (loading && !result) return <Progressing pageLoader />
    // if (error) {
    //     showError(error)
    //     if (!result) return null
    // }

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
                return <CollapsedList key={provider.name || Math.random().toString(36).substr(2, 5)}
                    id={provider.id}
                    name={provider.name}
                    hostList={hostList}
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
            })}
            {/* {[{ id: null, name: "", active: true, url: "", authMode: "ANONYMOUS" }].concat(result && Array.isArray(result.result) ? result.result : []).sort((a, b) => a.name.localeCompare(b.name)).map(git => <CollapsedList {...git} key={git.id || Math.random().toString(36).substr(2, 5)} reload={reload} />)} */}
        </section>
    )
}

function CollapsedList({ id, name, active, url, authMode, gitHostId, accessToken = "", userName = "", password = "", reload, hostListOption, hostList, getHostList, getProviderList, providerList, ...props }) {
    const [collapsed, toggleCollapse] = useState(true);
    const [enabled, toggleEnabled] = useState(active);
    const [loading, setLoading] = useState(false);

    useEffectAfterMount(() => {
        if (!collapsed) return
        async function update() {
            let payload = {
                id: id || 0, name, url, authMode, active: enabled,
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
        <article className={`collapsed-list collapsed-list--git collapsed-list--${id ? 'update' : 'create'}`}>
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
            {!collapsed && <GitForm {...{ id, name, active, url, authMode, gitHostId, accessToken, userName, password, hostList, hostListOption, getHostList, getProviderList, reload, providerList, toggleCollapse, }} />}
        </article>
    )
}

function GitForm({ id = null, name = "", active = false, url = "", gitHostId, authMode = null, accessToken = "", userName = "", password = "", hostListOption, hostList, reload, toggleCollapse, getHostList, getProviderList, providerList, ...props }) {
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            name: { value: name, error: "" },
            url: { value: url, error: "" },
            auth: { value: authMode, error: "" }
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
            }
        }, onValidation);

    let selectedGitHost = hostListOption.find((p) => p.value === gitHostId)
    const [loading, setLoading] = useState(false)
    const [gitHost, setGithost] = useState({ value: selectedGitHost, error: '' })
    const [customState, setCustomState] = useState({ password: { value: password, error: '' }, username: { value: userName, error: '' }, accessToken: { value: accessToken, error: '' } })
    const customHandleChange = e => setCustomState(state => ({ ...state, [e.target.name]: { value: e.target.value, error: "" } }))

    function handleGithostChange(host) {
        setGithost({
            value: host,
            error: host ? "" : "GitHost is required"
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

        let gitHostId = gitHost.value.value;
        console.log(gitHost.value.__isNew__)
        if (gitHost.value.__isNew__) {
            let gitHostPayload = {
                name: gitHost.value.value,
                active: true
            }
            try {
                const { result } = await saveGitHost(gitHostPayload);
                getHostList();
                gitHostId = result;
            } catch (error) {
                showError(error)
            }
        }

        let payload = {
            id: id || 0,
            name: state.name.value,
            gitHostId: gitHostId,
            url: state.url.value,
            authMode: state.auth.value,
            active,
            ...(state.auth.value === 'USERNAME_PASSWORD' ? { username: customState.username.value, password: customState.password.value } : {}),
            ...(state.auth.value === 'ACCESS_TOKEN' ? { accessToken: customState.accessToken.value } : {})
        }

        const api = id ? updateGitProviderConfig : saveGitProviderConfig
        try {
            setLoading(true)
            // const [{result: apiRes},{result: reloadRes}] = await Promise.all([api(payload, id), reload() ])
            // apiRes()
            // reloadRes()
             api(payload, id);
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
    const handleMenuOption = (value) => {
    }

    const MenuList = (props) => {
        const isNew = props.options.map((p)=>p.label)
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="w-100 bcn-0 pl-10 pt-5 pb-5">
                    <button className="no-decor bcn-0 cta--chart-store bw-0" onClick={(selected: any) => {handleMenuOption(props) }}>Option</button>
                </div>
            </components.MenuList>
        );
    };

    return (
        <>
            <form onSubmit={handleOnSubmit} className="git-form">
                
                <div className="mb-16">
                    <CustomInput autoComplete="off" value={state.name.value} onChange={handleOnChange} name="name" error={state.name.error} label="Name*" />
                </div>
                <div className="form__row form__row--two-third">
                    <div>
                        <label className="form__label">Git provider*</label>
                        <CreatableSelect
                            name="host"
                            value={gitHost.value}
                            className="react-select--height-44"
                            placeholder="Select git provider"
                            isMulti={false}
                            isSearchable
                            isClearable={false}
                            options={hostListOption}
                            styles={{
                                ...styles,
                            }}
                            components={{
                                IndicatorSeparator: null,
                                DropdownIndicator,
                                MenuList,
                            }}
                            onChange={(e) => handleGithostChange(e)}
                        />
                    </div>
                    <CustomInput autoComplete="off" value={state.url.value} onChange={handleOnChange} name="url" error={state.url.error} label="URL*" />
                </div>
                <div className="form__label">Authentication type*</div>
                <div className="form__row form__row--auth-type pointer">
                    {[{ label: 'User auth', value: 'USERNAME_PASSWORD' }, { label: 'Password/Auth token', value: "ACCESS_TOKEN" }, { label: 'Anonymous', value: 'ANONYMOUS' }]
                        .map(({ label: Lable, value }) => <label key={value} className="flex left pointer">
                            <input type="radio" name="auth" value={value} onChange={handleOnChange} checked={value === state.auth.value} /> {Lable}
                        </label>)}

                </div>
                {state.auth.error && <div className="form__error">{state.auth.error}</div>}
                {state.auth.value === 'USERNAME_PASSWORD' && <div className="form__row form__row--two-third">
                    <CustomInput value={customState.username.value} onChange={customHandleChange} name="username" error={customState.username.error} label="Username*" />
                    <ProtectedInput value={customState.password.value} onChange={customHandleChange} name="password" error={customState.password.error} label="Password*" />
                </div>}
                {state.auth.value === "ACCESS_TOKEN" && <div className="form__row">
                    <ProtectedInput value={customState.accessToken.value} onChange={customHandleChange} name="accessToken" error={customState.accessToken.error} label="Access token*" />
                </div>}
                <div className="form__row form__buttons">
                    <button className="cta cancel" type="button" onClick={e => toggleCollapse(t => !t)}>Cancel</button>
                    <button className="cta" type="submit" disabled={loading}>{loading ? <Progressing /> : id ? 'Update' : 'Save'}</button>
                </div>
            </form>
        </>
    )
}

