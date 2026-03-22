import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

import { actions, selectors } from 'ducks/certificateGroups';

import CustomTable, { TableDataRow, TableHeader } from 'components/CustomTable';
import Dialog from 'components/Dialog';
import GroupForm from '../form';
import Widget from 'components/Widget';
import { WidgetButtonProps } from 'components/WidgetButtons';
import { LockWidgetNameEnum } from 'types/user-interface';
import { useListPageState } from 'utils/use-list-page-state';

export default function GroupList() {
    const groups = useSelector(selectors.certificateGroups);

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
            createSucceeded: selectors.createGroupSucceeded,
            updateSucceeded: selectors.updateGroupSucceeded,
        },
        actions: {
            setCheckedRows: actions.setCheckedRows,
            list: actions.listGroups,
            bulkDelete: actions.bulkDeleteGroups,
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

    const groupsTableHeaders: TableHeader[] = useMemo(
        () => [
            {
                id: 'name',
                content: 'Name',
                sortable: true,
                sort: 'asc',
                width: '15%',
            },
            {
                id: 'description',
                content: 'Description',
                sortable: true,
            },
            {
                id: 'email',
                content: 'Email',
                sortable: true,
                sort: 'asc',
                width: '15%',
            },
        ],
        [],
    );

    const groupsTableData: TableDataRow[] = useMemo(
        () =>
            groups.map((group) => ({
                id: group.uuid,

                columns: [<Link to={`./detail/${group.uuid}`}>{group.name}</Link>, group.description || '', group.email || ''],
            })),
        [groups],
    );

    return (
        <>
            <Widget
                title="List of Groups"
                busy={isBusy}
                widgetLockName={LockWidgetNameEnum.ListOfGroups}
                widgetButtons={buttons}
                titleSize="large"
                refreshAction={getFreshData}
            >
                <CustomTable
                    headers={groupsTableHeaders}
                    data={groupsTableData}
                    onCheckedRowsChanged={setCheckedRows}
                    canSearch
                    hasCheckboxes
                    hasPagination
                />
            </Widget>

            <Dialog
                isOpen={confirmDelete}
                caption={`Delete ${checkedRows.length > 1 ? 'Groups' : 'a Group'}`}
                body={`You are about to delete ${checkedRows.length > 1 ? 'Groups' : 'a Group'}. Is this what you want to do?`}
                toggle={() => setConfirmDelete(false)}
                icon="delete"
                buttons={[
                    { color: 'danger', onClick: onDeleteConfirmed, body: 'Delete' },
                    { color: 'secondary', variant: 'outline', onClick: () => setConfirmDelete(false), body: 'Cancel' },
                ]}
            />

            <Dialog
                isOpen={isAddModalOpen || !!editingEntityId}
                toggle={handleCloseFormModal}
                caption={editingEntityId ? 'Edit Group' : 'Create Group'}
                size="xl"
                body={<GroupForm groupId={editingEntityId} onCancel={handleCloseFormModal} onSuccess={handleCloseFormModal} />}
            />
        </>
    );
}
