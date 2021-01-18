import React, { Component } from 'react';
import ReactSelect, { components } from 'react-select';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';
import { ReactComponent as Down } from '../../assets/icons/appstatus/ic-dropdown.svg';
import { Progressing } from '../common';
import error from '../../assets/icons/misc/errorInfo.svg';
import { UpdateMaterialState, MaterialViewProps } from './material.types';

export class MaterialView extends Component<MaterialViewProps, {}> {

    renderCollapsedView() {
        if ((this.props.material).id) {
            return <div key={`${(this.props.material).id}`} className="white-card artifact-collapsed" tabIndex={0}
                onClick={this.props.toggleCollapse}>
                <span className="git__icon"></span>
                <div className="">
                    <div className="git__provider">{(this.props.material).name}</div>
                    <p className="git__url">{this.props.material.url}</p>
                </div>
                <Down className="collapsed__icon icon-dim-20" style={{ transform: 'rotateX(180deg)' }} />
            </div>
        }
        return <div className="white-card white-card--add-new-item mb-16" onClick={this.props.toggleCollapse}>
            <Add className="icon-dim-24 mr-5 fcb-5 vertical-align-middle" />
            <span className="artifact__add">Add Material</span>
        </div>
    }

    renderForm() {
        let checkoutPathValue = this.props.isCheckoutPathValid(this.props.material.checkoutPath);
        return <form key={`${(this.props.material).id}`} className="white-card p-24 mb-16">
            <div className="white-card__header white-card__header--form">
                {(this.props.material).id ? "Edit Material" : "Add Material"}
                {(this.props.material).id ? <button type="button" className="transparent collapse-button" tabIndex={0} onClick={this.props.toggleCollapse}>
                    <Down className="collapsed__icon icon-dim-20" style={{ transform: 'rotateX(180deg)' }} />
                </button> : null}
            </div>
            <div className="form__row">
                <span className="form__label">Select Provider*</span>
                <ReactSelect className=""
                    isMulti={false}
                    isClearable={false}
                    value={this.props.material.gitProvider}
                    options={this.props.providers}
                    getOptionLabel={option => `${option.name}`}
                    getOptionValue={option => `${option.id}`}
                    onChange={this.props.handleProviderChange}
                    styles={{
                        control: (base, state) => ({
                            ...base,
                            border: state.isFocused ? '1px solid #0066CC' : '1px solid #d6dbdf',
                            boxShadow: 'none',
                            height: '56px'
                        }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                            fontWeight: "normal",
                            color: 'var(--N900)',
                            padding: '8px 12px',
                        }),
                    }}
                    components={{
                        IndicatorSeparator: null,
                        Option: (props) => {
                            return <components.Option {...props}>
                                {props.isSelected ? <Check className="icon-dim-16 vertical-align-middle scb-5 mr-8" /> : <span className="inline-block icon-dim-16 mr-8"></span>}
                                {props.label}
                            </components.Option>
                        }
                    }}
                />
                {!this.props.material.gitProvider?.id && <span className="form__error">
                    <img src={error} className="form__icon" />
                        This is a required field
                    </span>}
            </div>

            <label className="form__row">
                <span className="form__label">Git Repo URL*</span>
                <input className="form__input"
                    type="text"
                    placeholder="e.g. https://gitlab.com/abc/xyz.git"
                    value={this.props.material.url}
                    onChange={this.props.handleUrlChange} />
                <span className="form__error">
                    {!this.props.material.url && <>
                        <img src={error} className="form__icon" />This is a required field
                    </>}
                </span>
            </label>

            <label className="form__row">
                <span className="form__label">Checkout Path(*Required If you’re using multiple Git Materials)</span>
                <input className="form__input"
                    type="text"
                    placeholder="e.g. /abc"
                    value={this.props.material.checkoutPath}
                    onChange={this.props.handlePathChange} />
                <span className="form__error">
                    {!checkoutPathValue?.isValid && <> <img src={error} className="form__icon" /> {checkoutPathValue?.message}</>}
                </span>
            </label>
            <div className="form__buttons">
                {this.props.isMultiGit ?
                    <button type="button" className="cta cancel mr-16" onClick={this.props.cancel}>Cancel</button>
                    : null}
                <button type="button" className="cta" disabled={this.props.isLoading}
                    onClick={this.props.save}>
                    {this.props.isLoading ? <Progressing /> : "Save"}
                </button>
            </div>
        </form>
    }

    render() {
        if (this.props.isCollapsed) {
            return this.renderCollapsedView();
        }
        else {
            return this.renderForm();
        }
    }
}