import React, { Component } from 'react';
import img from '../../../../assets/img/ic-empty-error@2x.png';
import EmptyState from '../../../EmptyState/EmptyState';

interface EmptyStateCIMaterialProps {
  isRepoError: boolean;
  isBranchError: boolean;
  gitMaterialName: string;
  sourceValue: string;
  repoUrl: string;
  branchErrorMsg: string;
  repoErrorMsg: string;
  isMaterialLoading: boolean;
  onRetry: (...args) => void;
  anyCommit: boolean;
}

export class EmptyStateCIMaterial extends Component<EmptyStateCIMaterialProps> {

  getData(): { img, title, subtitle, cta } {
    if (this.props.isRepoError) {
      return {
        img: <img src={img} alt="no commits found" className="empty-state__img--ci-material" />,
        title: <h1 className="empty__title">{this.props.repoErrorMsg}</h1>,
        subtitle: <a href={`${this.props.repoUrl}`} rel="noopener noreferrer" target="_blank" className="">{this.props.repoUrl}</a>,
        cta: null
      }
    }
    else if (this.props.isBranchError) {
      return {
        img: <img src={img} alt="no commits found" className="empty-state__img--ci-material" />,
        title: <h1 className="empty__title">{this.props.branchErrorMsg}</h1>,
        subtitle: <a href={this.props.repoUrl} rel="noopener noreferrer" target="_blank" className="">{this.props.repoUrl}</a>,
        cta: null,
      }
    }
    else if (!this.props.anyCommit) {
      return {
        img: <img src={img} alt="no commits found" className="empty-state__img--ci-material" />,
        title: <h1 className="empty__title">No commit found</h1>,
        subtitle: `Sorry! No commit found. Please try again.`,
        cta: <button type="button" className="cta ghosted small" onClick={this.props.onRetry}>Retry</button>,
      }
    } else {
      return {
        img: <img src={img} alt="no commits found" className="empty-state__img--ci-material" />,
        title: <h1 className="empty__title">Failed to fetch</h1>,
        subtitle: `Sorry! We could not fetch available materials. Please try again.`,
        cta: <button type="button" className="cta ghosted small" onClick={this.props.onRetry}>Retry</button>,
      }
    }
  }

  render() {
    let { title, subtitle, img, cta } = this.getData();
    if (this.props.isMaterialLoading) {
      return <EmptyState>
        <EmptyState.Loading text={"Fetching repository. This might take few minutes"} />
      </EmptyState>
    }
    else {
      return <EmptyState >
        <EmptyState.Image>{img}</EmptyState.Image>
        <EmptyState.Title>{title}</EmptyState.Title>
        <EmptyState.Subtitle>{subtitle}</EmptyState.Subtitle>
        <EmptyState.Button>{cta}</EmptyState.Button>
      </EmptyState>
    }
  }
}