import { useState, useEffect } from 'react';
import { ZipEntry } from '@/stores';

export interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    entryPath: string | null;
    isDirectory: boolean;
}

export interface NewItemInputState {
    visible: boolean;
    parentPath: string;
    value: string;
    isDirectory: boolean;
}

/**
 * g 파일 트리의 우클릭 메뉴(컨텍스트 메뉴) 관리
*/
export function useFileTreeContextMenu() {

    // 컨텍스트 메뉴 상태
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        entryPath: null,
        isDirectory: false
    });

    // 새 파일/폴더 입력 상태
    const [newItemInput, setNewItemInput] = useState<NewItemInputState>({
        visible: false,
        parentPath: '',
        value: '',
        isDirectory: false
    });

    // 컨텍스트 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        
        const handleClickOutside = () => {
            
            setContextMenu(prev => ({ ...prev, visible: false }));
        };

        if (contextMenu.visible) document.addEventListener('click', handleClickOutside);
        
        return () => {

            document.removeEventListener('click', handleClickOutside);
        };

    }, [contextMenu.visible]);

    /**
     * g 항목 오른쪽 클릭 핸들러
    */
    const handleContextMenu = (e: React.MouseEvent, entry: ZipEntry) => {

        e.preventDefault();
        e.stopPropagation();

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            entryPath: entry.path,
            isDirectory: entry.isDirectory
        });
    };

    /**
     * g 최상위 영역 우클릭 핸들러
    */
    const handleTreeContainerContextMenu = (e: React.MouseEvent) => {
        
        e.preventDefault();

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            entryPath: '',
            isDirectory: false
        });
    };

    /**
     * g 파일/폴더 추가 폼 표시 
    */
    const showAddItemInput = (parentPath: string, isDirectory: boolean) => {

        setContextMenu(prev => ({ ...prev, visible: false }));
        
        setNewItemInput({
            visible: true,
            parentPath,
            value: '',
            isDirectory
        });
    };

    return {
        contextMenu,
        setContextMenu,
        newItemInput,
        setNewItemInput,
        handleContextMenu,
        handleTreeContainerContextMenu,
        showAddItemInput
    };
}