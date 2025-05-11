import { useEffect, useRef } from 'react';
import { useFileStore, OpenFile } from '@/stores';
import { getFilenameFromPath } from '@/utils/tabUtils';

/**
 * g 탭 관리를 위한 커스텀 훅
*/
export function useTabManagement() {

    const openFiles = useFileStore(state => state.openFiles);
    const setOpenFiles = useFileStore(state => state.setOpenFiles);
    const currentFilePath = useFileStore(state => state.currentFilePath);
    const currentFileContent = useFileStore(state => state.currentFileContent);
    const setCurrentFile = useFileStore(state => state.setCurrentFile);
    const zipContent = useFileStore(state => state.zipContent);
    
    // 마지막으로 처리된 상태를 기록하기 위한 ref
    const processedRef = useRef<{
        openFiles: OpenFile[];
        currentPath: string | null;
    }>({
        openFiles: [],
        currentPath: null
    });

    // 현재 파일이 열려있는 상태에서 탭에 추가
    useEffect(() => {

        if (!currentFilePath || !currentFileContent) return;
        
        // 마지막 처리와 동일한 상태면 중복 처리하지 않음
        if (
            processedRef.current.currentPath === currentFilePath && 
            JSON.stringify(processedRef.current.openFiles) === JSON.stringify(openFiles)
        ) return;
        
        
        // 파일이 zipContent에 있는지 확인
        const fileExistsInZip = zipContent?.some(entry => 

            !entry.isDirectory && entry.path === currentFilePath
        );
        
        // 파일이 zipContent에 없으면 탭에 추가하지 않음
        if (!fileExistsInZip) return;

        // 이미 열려있는 파일인지 확인
        const existingFileIndex = openFiles.findIndex(file => file.path === currentFilePath);

        if (existingFileIndex === -1) {

            // 새로운 파일일 경우 탭에 추가
            const fileName = getFilenameFromPath(currentFilePath);
            
            const newOpenFile: OpenFile = {
                path: currentFilePath,
                name: fileName,
                content: currentFileContent
            };

            setOpenFiles([...openFiles, newOpenFile]);

        } else {
            
            // 이미 열려있는 파일일 경우 컨텐츠 업데이트 (필요한 경우)
            if (openFiles[existingFileIndex].content !== currentFileContent) {

                const updatedFiles = [...openFiles];
                updatedFiles[existingFileIndex].content = currentFileContent;
                setOpenFiles(updatedFiles);
            }
        }
        
        // 처리 상태 업데이트
        processedRef.current = {
            openFiles: [...openFiles],
            currentPath: currentFilePath
        };

    }, [currentFilePath, currentFileContent, openFiles, zipContent, setOpenFiles]);
    
    // 삭제된 파일탭 정리
    useEffect(() => {

        if (!zipContent || openFiles.length === 0) return;
        
        // 현재 zipContent에 없는 파일 탭 찾기
        const deletedFileTabs = openFiles.filter(file => 
            
            !zipContent.some(entry => entry.path === file.path)
        );
        
        // 삭제된 파일 탭이 있으면 제거
        if (deletedFileTabs.length > 0) {
            
            const updatedFiles = openFiles.filter(file => 
                
                !deletedFileTabs.some(deletedFile => deletedFile.path === file.path)
            );
            
            setOpenFiles(updatedFiles);
            
            // 현재 선택된 파일이 삭제된 파일이면 다른 파일로 전환
            if (currentFilePath && deletedFileTabs.some(file => file.path === currentFilePath)) {
                
                if (updatedFiles.length > 0) {
                    
                    const lastFile = updatedFiles[updatedFiles.length - 1];
                    setCurrentFile(lastFile.path, lastFile.content);

                } else {
                    
                    setCurrentFile(null, null);
                }
            }
        }
        
    }, [zipContent, openFiles, currentFilePath, setOpenFiles, setCurrentFile]);

    return {
        processedRef
    };
}