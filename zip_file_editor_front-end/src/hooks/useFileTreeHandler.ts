import { useState, useCallback } from 'react';
import { useFileStore, ZipEntry } from '@/stores';
import { ContextMenuState, NewItemInputState } from './useFileTreeContextMenu';

/**
 * g 파일/폴더 추가, 삭제 등 조작 기능 제공
*/
export function useFileTreeHandler() {

    const [handlerError] = useState<string | null>(null);

    const zipContent = useFileStore(state => state.zipContent);
    const setZipContent = useFileStore(state => state.setZipContent);
    const unzippedFiles = useFileStore(state => state.unzippedFiles);
    const setUnzippedFiles = useFileStore(state => state.setUnzippedFiles);
    const openFiles = useFileStore(state => state.openFiles);
    const setOpenFiles = useFileStore(state => state.setOpenFiles);
    const currentFilePath = useFileStore(state => state.currentFilePath);
    const setCurrentFile = useFileStore(state => state.setCurrentFile);
    const expandedDirs = useFileStore(state => state.expandedDirs);
    const setExpandedDirs = useFileStore(state => state.setExpandedDirs);

    /**
     * g 새 파일/폴더 추가 핸들러
    */
    const handleAddItem = useCallback((
        e: React.FormEvent,
        newItemInput: NewItemInputState,
        setNewItemInput: React.Dispatch<React.SetStateAction<NewItemInputState>>
    ) => {

        e.preventDefault();

        if (!newItemInput.value.trim() || !zipContent || !unzippedFiles) {

            setNewItemInput(prev => ({ ...prev, visible: false }));
            return;
        }

        const parentPath = newItemInput.parentPath;
        const itemName = newItemInput.value.trim();
        const isDirectory = newItemInput.isDirectory;

        // 부모 경로에 기반해 새 항목 경로 생성
        let newPath = parentPath ? `${parentPath}${itemName}` : itemName;
        if (isDirectory && !newPath.endsWith('/')) newPath += '/';
        

        // 동일한 경로의 항목이 존재하는지 확인
        const exists = zipContent.some(entry => entry.path === newPath);
        if (exists) {

            alert(`이미 \"${newPath}\" 경로에 항목이 존재합니다.`);
            setNewItemInput(prev => ({ ...prev, visible: false }));
            return;
        }

        // 새 항목 생성
        const newEntry: ZipEntry = {
            name: itemName,
            path: newPath,
            isDirectory,
            size: 0,
            lastModified: new Date()
        };

        // zipContent 업데이트
        const updatedZipContent = [...zipContent, newEntry];
        setZipContent(updatedZipContent);

        // 디렉토리인 경우 해당 디렉토리 확장
        if (isDirectory) {

            // 이미 있는지 확인하고 없으면 추가
            if (!expandedDirs.includes(newPath)) {

                const newExpandedDirs = [...expandedDirs, newPath];
                setExpandedDirs(newExpandedDirs);
            }

        } else {
            
            // 파일인 경우 직접 파일 내용 생성 및 관련 상태 업데이트
            const emptyContent = ''; // 빈 문자열 콘텐츠

            // 바이너리 콘텐츠 생성
            const emptyContentBytes = new TextEncoder().encode(emptyContent);

            // unzippedFiles 업데이트
            const updatedUnzippedFiles = { ...unzippedFiles };
            updatedUnzippedFiles[newPath] = emptyContentBytes;

            // openFiles 업데이트
            const updatedOpenFiles = [
                ...openFiles,
                {
                    path: newPath,
                    name: itemName,
                    content: emptyContent
                }
            ];

            // 모든 상태 업데이트를 순차적으로 수행
            setUnzippedFiles(updatedUnzippedFiles);
            setOpenFiles(updatedOpenFiles);

            // 상태 업데이트 확인을 위한 로그
            console.log('새 파일 생성:', newPath);
            console.log('unzippedFiles 업데이트 후(예상):', Object.keys(updatedUnzippedFiles).length);

            // 직접 현재 파일로 설정
            setCurrentFile(newPath, emptyContent);
        }

        // 입력 폼 닫기
        setNewItemInput(prev => ({ ...prev, visible: false }));

    }, [
        zipContent,
        unzippedFiles,
        expandedDirs,
        openFiles,
        setZipContent,
        setExpandedDirs,
        setUnzippedFiles,
        setOpenFiles,
        setCurrentFile
    ]);

    /**
     * g 항목 삭제 핸들러 
    */ 
    const handleDeleteItem = useCallback((
        entryPath: string,
        isDirectory: boolean,
        setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>
    ) => {

        if (!zipContent || !unzippedFiles) return;

        // 컨텍스트 메뉴 닫기
        setContextMenu(prev => ({ ...prev, visible: false }));

        // 삭제 확인
        if (!confirm(`정말로 \"${entryPath}\"${isDirectory ? ' 폴더와 모든 내용물' : ''}을(를) 삭제하시겠습니까?`)) return;

        // 삭제할 항목 찾기
        if (isDirectory) {

            // 디렉토리의 경우 하위 항목 모두 찾아서 삭제
            const updatedZipContent = zipContent.filter(entry =>
                
                !entry.path.startsWith(entryPath)
            );
            setZipContent(updatedZipContent);

            // unzippedFiles에서도 해당 경로 항목들 삭제
            const updatedUnzippedFiles = { ...unzippedFiles };
            Object.keys(updatedUnzippedFiles).forEach(path => {

                if (path.startsWith(entryPath)) delete updatedUnzippedFiles[path];
            });
            setUnzippedFiles(updatedUnzippedFiles);

            // openFiles에서 해당 경로 항목들 삭제 - 정확한 경로 매칭
            const updatedOpenFiles = openFiles.filter(file => !file.path.startsWith(entryPath));
            setOpenFiles(updatedOpenFiles);

            // 확장된 디렉토리에서 해당 경로 제거
            const newExpandedDirs = expandedDirs.filter(path => path !== entryPath);
            setExpandedDirs(newExpandedDirs);

            // 현재 열린 파일이 삭제되는 디렉토리 내의 파일인지 확인
            if (currentFilePath && currentFilePath.startsWith(entryPath)) {

                if (updatedOpenFiles.length > 0) {

                    // 남은 파일 중 가장 마지막 파일을 활성화
                    const lastOpenFile = updatedOpenFiles[updatedOpenFiles.length - 1];
                    setCurrentFile(lastOpenFile.path, lastOpenFile.content);

                } else {

                    // 열린 파일이 없으면 현재 파일 초기화
                    setCurrentFile(null, null);
                }
            }

        } else {

            // 단일 파일 삭제
            const updatedZipContent = zipContent.filter(entry => entry.path !== entryPath);
            setZipContent(updatedZipContent);

            // unzippedFiles에서도 해당 파일 삭제
            const updatedUnzippedFiles = { ...unzippedFiles };
            delete updatedUnzippedFiles[entryPath];
            setUnzippedFiles(updatedUnzippedFiles);

            // openFiles에서 해당 경로 항목들 삭제
            const updatedOpenFiles = openFiles.filter(file => file.path !== entryPath);
            setOpenFiles(updatedOpenFiles);

            // 현재 열린 파일이 삭제되는 파일인지 확인
            if (currentFilePath === entryPath) {
                
                if (updatedOpenFiles.length > 0) {
                    
                    // 남은 파일 중 가장 마지막 파일을 활성화
                    const lastOpenFile = updatedOpenFiles[updatedOpenFiles.length - 1];
                    setCurrentFile(lastOpenFile.path, lastOpenFile.content);

                } else {

                    // 열린 파일이 없으면 현재 파일 초기화
                    setCurrentFile(null, null);
                }
            }
        }
        
    }, [
        zipContent,
        unzippedFiles,
        openFiles,
        currentFilePath,
        expandedDirs,
        setZipContent,
        setUnzippedFiles,
        setOpenFiles,
        setCurrentFile,
        setExpandedDirs
    ]);

    return {
        handleAddItem,
        handleDeleteItem,
        handlerError
    };
}