'use client';

import styles from './FileTree.module.css';
import React, { useEffect, useState } from 'react';
import { useFileStore, ZipEntry } from '@/stores';
import { createDirectoryMap, getFileIcon } from '@/utils/fileTreeUtils';
import { useFileTreeContextMenu } from '@/hooks/useFileTreeContextMenu';
import { useFileTreeNavigation } from '@/hooks/useFileTreeNavigation';
import { useFileTreeHandler } from '@/hooks/useFileTreeHandler';

function FileTree() {

    const zipContent = useFileStore((state) => state.zipContent);
    const selectedFile = useFileStore((state) => state.selectedFile);
    const setCurrentFile = useFileStore((state) => state.setCurrentFile);
    const expandedDirs = useFileStore((state) => state.expandedDirs);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { contextMenu, setContextMenu, newItemInput, setNewItemInput, handleContextMenu, handleTreeContainerContextMenu, showAddItemInput } = useFileTreeContextMenu();
    const { handleItemClick, navigationError } = useFileTreeNavigation();
    const {
        handleAddItem: baseHandleAddItem,
        handleDeleteItem: baseHandleDeleteItem,
        handlerError
    } = useFileTreeHandler();

    // 에러 처리
    useEffect(() => {

        if (navigationError !== null) setError(navigationError);
        if (handlerError !== null) setError(handlerError);

    }, [navigationError, handlerError])

    // zipContent, selectedFile 변경시 파일 선택 초기화
    useEffect(() => {

        if (!zipContent || !selectedFile) {

            // 현재 선택된 파일도 초기화
            setCurrentFile(null, null);
            return;
        }

        setLoading(false);

    }, [zipContent, selectedFile, setCurrentFile]);

    /**
     * g 새 파일/폴더 추가 핸들러 
    */
    const handleAddItem = (e: React.FormEvent) => {

        baseHandleAddItem(e, newItemInput, setNewItemInput);
    };

    /**
     * g 항목 삭제 핸들러
    */
    const handleDeleteItem = (entryPath: string, isDirectory: boolean) => {

        baseHandleDeleteItem(entryPath, isDirectory, setContextMenu);
    };

    /**
     * g 파일 트리 구조 렌더링
    */
    const renderFileTree = () => {

        if (!zipContent) return null;

        const { dirMap, rootEntries } = createDirectoryMap(zipContent);

        /**
         * g 새 파일/폴더 입력폼
        */
        const contextFormItem = (level = 0) => {

            return (
                <div
                    className={styles.newItemForm}
                    style={{ paddingLeft: `${(level + 1) * 16}px` }}
                >
                    <form onSubmit={handleAddItem}>
                        <input
                            type="text"
                            value={newItemInput.value}
                            onChange={(e) => setNewItemInput(prev => ({ ...prev, value: e.target.value }))}
                            placeholder={`새 ${newItemInput.isDirectory ? '폴더' : '파일'} 이름`}
                            autoFocus
                            onBlur={() => setNewItemInput(prev => ({ ...prev, visible: false }))}
                        />
                    </form>
                </div>
            );
        }

        /**
         * g 트리 렌더링 
        */
        const renderTreeItems = (entries: ZipEntry[], level = 0) => {

            return entries.map(entry => (
                <div key={entry.path} className={styles.treeItem}>
                    <div
                        className={styles.itemHeader}
                        style={{ paddingLeft: `${level * 16}px` }}
                        onClick={() => handleItemClick(entry)}
                        onContextMenu={(e) => handleContextMenu(e, entry)}
                    >
                        <span className={styles.itemIcon}>
                            {entry.isDirectory ? '📁' : getFileIcon(entry.name)}
                        </span>
                        <span className={styles.itemName}>{entry.name}</span>
                        {entry.isDirectory && (
                            <span className={styles.expandIcon}>
                                {expandedDirs.includes(entry.path) ? 'ᐱ' : 'ᐯ'}
                            </span>
                        )}
                    </div>

                    {/* 새 파일/폴더 입력폼 */}
                    {newItemInput.visible && newItemInput.parentPath === entry.path && entry.isDirectory && contextFormItem(level)}

                    {entry.isDirectory && dirMap.has(entry.path) && expandedDirs.includes(entry.path) && (
                        <div className={styles.itemChildren}>
                            {renderTreeItems(dirMap.get(entry.path) || [], level + 1)}
                        </div>
                    )}
                </div>
            ));
        };

        return (
            <div className={styles.treeContainer}>
                {renderTreeItems(rootEntries)}

                {/* 최상위 새 파일/폴더 입력폼 */}
                {newItemInput.visible && newItemInput.parentPath === '' && contextFormItem(-1)}
            </div>
        );
    };

    return (
        <div className={styles.fileTree}>
            <div
                className={styles.treeContent}
                onContextMenu={handleTreeContainerContextMenu}
            >
                {error && (
                    <div className={styles.errorMessage}>{error}</div>
                )}

                {!loading && (!zipContent || zipContent.length === 0) && !error && (
                    <div className={styles.emptyState}>
                        <p>ZIP 파일을 업로드하면 내용이 여기에 표시됩니다.</p>
                    </div>
                )}

                {loading && (
                    <div className={styles.loadingState}>ZIP 파일 분석 중...</div>
                )}

                {zipContent && zipContent.length > 0 && !error && renderFileTree()}

                {contextMenu.visible && (
                    <div
                        className={styles.contextMenu}
                        style={{
                            left: `${contextMenu.x}px`,
                            top: `${contextMenu.y}px`
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 디렉토리이거나 최상위 영역인 경우 새 파일/폴더 메뉴 표시 */}
                        {(contextMenu.isDirectory || contextMenu.entryPath === '') && (
                            <>
                                <div
                                    className={styles.contextMenuItem}
                                    onClick={() => showAddItemInput(contextMenu.entryPath || '', false)}
                                >
                                    새 파일
                                </div>
                                <div
                                    className={styles.contextMenuItem}
                                    onClick={() => showAddItemInput(contextMenu.entryPath || '', true)}
                                >
                                    새 폴더
                                </div>
                                {contextMenu.entryPath && <div className={styles.contextMenuDivider}></div>}
                            </>
                        )}

                        {/* 항목이 선택된 경우거나 최상위 영역이 아닌 경우 삭제 메뉴 표시 */}
                        {contextMenu.entryPath && (
                            <div
                                className={styles.contextMenuItem}
                                onClick={() => handleDeleteItem(contextMenu.entryPath!, contextMenu.isDirectory)}
                            >
                                삭제
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(FileTree);