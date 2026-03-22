import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import Badge from 'components/Badge';

import { actions, selectors } from 'ducks/credentials';

import Widget from 'components/Widget';
import CredentialForm from '../form';
import { WidgetButtonProps } from 'components/WidgetButtons';

import CustomTable, { TableDataRow, TableHeader } from 'components/CustomTable';
import Dialog from 'components/Dialog';
import { LockWidgetNameEnum } from 'types/user-interface';
import { useListPageState } from 'utils/use-list-page-state';

function CredentialList() {
    const credentials = useSelector(selectors.credentials);

    const {
        checkedRows,
        isBusy,
        confirmDelete,
        setConfirmDelete,
        isAddModalOpen,
        editingEntityId,
        getFreshData,
        handleOpenFormModal,
        handleCloseFormModal,
        onDeleteConfirmed,
        setCheckedRows,
    } = useListPageState({
        selectors: {
            checkedRows: selectors.checkedRows,
            isFetchingList: selectors.isFetchingList,
            isDeleting: selectors.isDeleting,
            isBulkDeleting: selectors.isBulkDeleting,
            isCreating: selectors.isCreating,
            isUpdating: selectors.isUpdating,
            createSucceeded: selectors.createCredentialSucceeded,
            updateSucceeded: selectors.updateCredentialSucceeded,
        },
        actions: {
            setCheckedRows: actions.setCheckedRows,
            list: actions.listCredentials,
            bulkDelete: actions.bulkDeleteCredentials,
            clearDeleteErrorMessages: actions.clearDeleteErrorMessages,
        },
    });

    const buttons: WidgetButtonProps[] = useMemo(
        () => [
            {
                icon: 'plus',
                disabled: false,
                tooltip: 'Create',
                onClick: handleOpenFormModal,
            },
            {
                icon: 'trash',
                disabled: checkedRows.length === 0,
                tooltip: 'Delete',
                onClick: () => {
                    setConfirmDelete(true);
                },
            },
        ],
        [checkedRows, handleOpenFormModal, setConfirmDelete],
    );

    const credentialRowHeaders: TableHeader[] = useMemo(
        () => [
            {
                content: 'Name',
                sortable: true,
                sort: 'asc',
                id: 'adminName',
                width: '50%',
            },
            {
                content: 'Kind',
                sortable: true,
                id: 'kind',
                width: '20%',
                align: 'center',
            },
            {
                content: 'Credential Provider',
                sortable: true,
                id: 'credentialProviderName',
                width: '30%',
                align: 'center',
            },
        ],
        [],
    );

    const credentialsData: TableDataRow[] = useMemo(
        () =>
            credentials.map((credential) => ({
                id: credential.uuid,
                columns: [
                    <Link to={`./detail/${credential.uuid}`}>{credential.name}</Link>,

                    <Badge color="primary">{credential.kind}</Badge>,

                    credential.connectorName ? (
                        <Link to={`../connectors/detail/${credential.connectorUuid}`}>{credential.connectorName ?? 'Unassigned'}</Link>
                    ) : (
                        (credential.connectorName ?? 'Unassigned')
                    ),
                ],
            })),

        [credentials],
    );

    return (
        <>
            <Widget
                title="Credential Store"
                busy={isBusy}
                widgetLockName={LockWidgetNameEnum.CredentialStore}
                widgetButtons={buttons}
                titleSize="large"
                refreshAction={getFreshData}
            >
                <CustomTable
                    headers={credentialRowHeaders}
                    data={credentialsData}
                    onCheckedRowsChanged={setCheckedRows}
                    hasCheckboxes={true}
                    hasPagination={true}
                    canSearch={true}
                />
            </Widget>

            <Dialog
                isOpen={confirmDelete}
                caption={`Delete ${checkedRows.length > 1 ? 'Credentials' : 'a Credential'}`}
                body={`You are about to delete ${checkedRows.length > 1 ? 'Credentials' : 'a Credential'}. Is this what you want to do?`}
                toggle={() => setConfirmDelete(false)}
                icon="delete"
                buttons={[
                    { color: 'secondary', variant: 'outline', onClick: () => setConfirmDelete(false), body: 'Cancel' },
                    { color: 'danger', onClick: onDeleteConfirmed, body: 'Delete' },
                ]}
            />

            <Dialog
                isOpen={isAddModalOpen || !!editingEntityId}
                toggle={handleCloseFormModal}
                caption={editingEntityId ? 'Edit Credential' : 'Create Credential'}
                size="xl"
                body={<CredentialForm credentialId={editingEntityId} onCancel={handleCloseFormModal} onSuccess={handleCloseFormModal} />}
            />
        </>
    );
}

export default CredentialList;
