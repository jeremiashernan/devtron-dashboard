import moment from 'moment'
import React from 'react'
import { Moment12HourFormat } from '../../config'
import { ReactComponent as Bulb } from '../../assets/icons/ic-slant-bulb.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete-interactive.svg'
import './apiToken.scss'
import { deleteGeneratedAPIToken } from './service'
import { toast } from 'react-toastify'
import { showError } from '../common'
import { useHistory, useRouteMatch } from 'react-router-dom'

function APITokenList({ tokenList, setDeleteConfirmation, renderSearchToken, handleGenerateRowActionButton }) {
    const history = useHistory()
    const match = useRouteMatch()

    const deleteToken = (userId) => {
        deleteGeneratedAPIToken(userId)
            .then((response) => {
                if (response.code === 200) {
                    toast.success('Token Deleted!!!')
                    let url = match.path.split('edit')[0]
                    history.push(`${url}list`)
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    return (
        <div>
            <div className="cn-9 fw-6 fs-16">API tokens</div>
            <p className="fs-13 fw-4">Tokens you have generated that can be used to access the Devtron API.</p>
            <div className="flex content-space">
                <button className="cta" onClick={() => handleGenerateRowActionButton('create')}>
                    Generate new token
                </button>
                {renderSearchToken()}
            </div>
            <div className="mt-16 en-2 bw-1 bcn-0 br-8" style={{ minHeight: 'calc(100vh - 235px)' }}>
                <div className="api-list-row fw-6 cn-7 fs-12 border-bottom pt-10 pb-10 pr-20 pl-20 text-uppercase">
                    <div></div>
                    <div>Name</div>
                    <div>Last Used On</div>
                    <div>Ip address</div>
                    <div>Expires on</div>
                    <div></div>
                </div>
                {tokenList?.map((list, index) => (
                    <div
                        key={`api_${index}`}
                        className="api-list-row fw-4 cn-9 fs-13 border-bottom-n1 pt-12 pb-12 pr-20 pl-20"
                    >
                        <button type="button" className=" transparent  ">
                            <Bulb className="scn-5 icon-dim-20" />
                        </button>
                        <div className="flexbox">{list.name}</div>
                        <div className="ellipsis-right">{moment(list.lastUsedAt).format(Moment12HourFormat)}</div>
                        <div>{list.lastUsedByIp}</div>
                        <div>{list.expireAtInMs}</div>
                        <div className="api__row-actions flex">
                            <button
                                type="button"
                                className="transparent mr-16"
                                onClick={() => handleGenerateRowActionButton('edit', list.userId)}
                            >
                                <Edit className="icon-dim-20" />
                            </button>
                            <button
                                type="button"
                                className="transparent"
                                onClick={() => {
                                    setDeleteConfirmation(false)
                                }}
                            >
                                <Trash className="scn-5 icon-dim-20" onClick={() => deleteToken(list.userId)} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default APITokenList
