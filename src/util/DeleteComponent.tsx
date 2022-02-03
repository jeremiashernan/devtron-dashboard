import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationDialog, DeleteDialog, showError } from '../components/common';
import { ServerErrors } from '../modals/commonTypes';
import info from '../assets/icons/ic-info-filled.svg';
import { useHistory } from 'react-router';

function DeleteComponent({
    setDeleting,
    toggleConfirmation,
    deleteComponent,
    title,
    component,
    payload,
    confirmationDialogDescription,
    redirectTo = false,
    url = '',
    reload,
    configuration = '',
}) {
    const [showConfirmationDialogModal, setConfirmationDialogModal] = useState(false);
    const { push } = useHistory();

    async function handleDelete() {
        setDeleting(true);
        try {
            await deleteComponent(payload);
            toast.success('Successfully deleted');
            toggleConfirmation(false);
            setDeleting(false);
            redirectTo ? push(url) : reload();
        } catch (serverError) {
            showError(serverError);
            if (serverError instanceof ServerErrors && serverError.code === 500) {
                setConfirmationDialogModal(true);
                setDeleting(false);
            }
        } finally {
            setDeleting(false);
        }
    }

    const confirmationDialogModal = () => {
        return (
            <ConfirmationDialog className="confirmation-dialog__body--w-360">
                <ConfirmationDialog.Icon src={info} />
                <ConfirmationDialog.Body title={`Cannot delete ${component} '${title}'`} />
                <p className="fs-13 cn-7 ">{confirmationDialogDescription}</p>
                <ConfirmationDialog.ButtonGroup>
                    <button
                        type="button"
                        className="cta"
                        onClick={() => {
                            toggleConfirmation(false);
                            setConfirmationDialogModal(true);
                        }}
                    >
                        Okay
                    </button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        );
    };

    const renderDeleteDialog = () => {
        return (
            <DeleteDialog
                title={`Delete ${component} '${title}'`}
                delete={handleDelete}
                closeDelete={() => toggleConfirmation(false)}
            >
                <DeleteDialog.Description>
                    <p>Are you sure you want to delete this {configuration ? configuration : component}? </p>
                </DeleteDialog.Description>
            </DeleteDialog>
        );
    };
    return (
        <div>
            {renderDeleteDialog()}
            {showConfirmationDialogModal && confirmationDialogModal()}
        </div>
    );
}

export default DeleteComponent;
