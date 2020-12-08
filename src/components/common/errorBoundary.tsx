import React, { Component } from 'react';
import * as Sentry from '@sentry/browser';
import bugFixing from '../../assets/img/bug_fixing.svg';
interface errorBoundaryState{
    eventId: any;
    hasError: boolean;
}
export default class ErrorBoundary extends Component<{}, errorBoundaryState>{
    constructor(props) {
        super(props);
        this.state = { eventId: null, hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        Sentry.withScope(scope=>{
            scope.setExtras(errorInfo);
            scope.setTag("page", "error-boundary");
            const eventId = Sentry.captureException(error);
            this.setState({ eventId});
        });
    }


    componentDidUpdate(prevProps, prevState){
        if(prevProps.children !== this.props.children){
            this.setState({hasError: false})
        }
    }

    render() {
        if (this.state.hasError) {
            return (
            <div className="flex column" style={{width:'100%', height:'100%'}}>
                <img src={bugFixing} alt="" style={{height:'300px', width:'auto', marginBottom:'20px'}}/>
                <h2 style={{ marginBottom: '20px'}}>We encountered an error.</h2>
                <button type="button" className="cta" onClick={() => Sentry.showReportDialog({ eventId: this.state.eventId })}>Report feedback</button>
            </div>
            );
        }
        else {
            return this.props.children
        }
    }

}
