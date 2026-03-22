import { UnknownAction } from '@reduxjs/toolkit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRunOnSuccessfulFinish } from 'utils/common-hooks';
import { AppState } from 'ducks';

type Selector<T> = (state: AppState) => T;

type ListPageActions = {
    setCheckedRows: (payload: { checkedRows: string[] }) => UnknownAction;
    list: () => UnknownAction;
    bulkDelete: (payload: { uuids: string[] }) => UnknownAction;
    clearDeleteErrorMessages?: () => UnknownAction;
};

type ListPageSelectors = {
    checkedRows: Selector<string[]>;
    isFetchingList: Selector<boolean>;
    isDeleting: Selector<boolean>;
    isBulkDeleting: Selector<boolean>;
    isCreating: Selector<boolean>;
    isUpdating: Selector<boolean>;
    createSucceeded: Selector<boolean>;
    updateSucceeded: Selector<boolean>;
};

type UseListPageStateConfig = {
    actions: ListPageActions;
    selectors: ListPageSelectors;
};

export function useListPageState(config: UseListPageStateConfig) {
    const dispatch = useDispatch();
    const actionsRef = useRef(config.actions);

    useEffect(() => {
        actionsRef.current = config.actions;
    });

    const checkedRows = useSelector(config.selectors.checkedRows);
    const isFetchingList = useSelector(config.selectors.isFetchingList);
    const isDeleting = useSelector(config.selectors.isDeleting);
    const isBulkDeleting = useSelector(config.selectors.isBulkDeleting);
    const isCreating = useSelector(config.selectors.isCreating);
    const isUpdating = useSelector(config.selectors.isUpdating);
    const createSucceeded = useSelector(config.selectors.createSucceeded);
    const updateSucceeded = useSelector(config.selectors.updateSucceeded);

    const isBusy = isFetchingList || isDeleting || isUpdating || isBulkDeleting;

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEntityId, setEditingEntityId] = useState<string | undefined>(undefined);

    const getFreshData = useCallback(() => {
        dispatch(actionsRef.current.setCheckedRows({ checkedRows: [] }));
        actionsRef.current.clearDeleteErrorMessages && dispatch(actionsRef.current.clearDeleteErrorMessages());
        dispatch(actionsRef.current.list());
    }, [dispatch]);

    useEffect(() => {
        getFreshData();
    }, [getFreshData]);

    const onCreateSucceeded = useCallback(() => {
        setIsAddModalOpen(false);
        getFreshData();
    }, [getFreshData]);

    const onUpdateSucceeded = useCallback(() => {
        setEditingEntityId(undefined);
        getFreshData();
    }, [getFreshData]);

    useRunOnSuccessfulFinish(isCreating, createSucceeded, onCreateSucceeded);
    useRunOnSuccessfulFinish(isUpdating, updateSucceeded, onUpdateSucceeded);

    const handleOpenFormModal = useCallback(() => setIsAddModalOpen(true), []);
    const handleCloseFormModal = useCallback(() => {
        setIsAddModalOpen(false);
        setEditingEntityId(undefined);
    }, []);

    const onDeleteConfirmed = useCallback(() => {
        setConfirmDelete(false);
        actionsRef.current.clearDeleteErrorMessages && dispatch(actionsRef.current.clearDeleteErrorMessages());
        dispatch(actionsRef.current.bulkDelete({ uuids: checkedRows }));
    }, [dispatch, checkedRows]);

    const setCheckedRows = useCallback(
        (rows: (string | number)[]) => {
            dispatch(actionsRef.current.setCheckedRows({ checkedRows: rows as string[] }));
        },
        [dispatch],
    );

    return {
        checkedRows,
        isBusy,
        isCreating,
        isUpdating,
        confirmDelete,
        setConfirmDelete,
        isAddModalOpen,
        setIsAddModalOpen,
        editingEntityId,
        setEditingEntityId,
        getFreshData,
        handleOpenFormModal,
        handleCloseFormModal,
        onDeleteConfirmed,
        setCheckedRows,
    };
}
