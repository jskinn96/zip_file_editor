import { useCallback } from 'react';
import { useFileStore, OpenFile } from '@/stores';

/**
 * g 탭 이벤트 처리를 위한 커스텀 훅
*/
export function useTabEvents() {
    
    const openFiles = useFileStore(state => state.openFiles);
    const setOpenFiles = useFileStore(state => state.setOpenFiles);
    const currentFilePath = useFileStore(state => state.currentFilePath);
    const setCurrentFile = useFileStore(state => state.setCurrentFile);

    /**
     * g 열린 파일 탭 클릭 핸들러
    */
    const handleTabClick = useCallback((file: OpenFile) => {
        
        // 현재 파일과 같은 파일 클릭 시 아무 동작 없음
        if (currentFilePath === file.path) return;
        
        // 클릭한 파일로 현재 파일 설정
        setCurrentFile(file.path, file.content);

    }, [currentFilePath, setCurrentFile]);
    
    /**
     * g 탭 닫기 핸들러
    */
    const handleCloseTab = useCallback((e: React.MouseEvent, path: string) => {
        
        e.preventDefault();
        e.stopPropagation();

        // 현재 열려있는 파일에서 해당 탭 제거
        const updatedFiles = openFiles.filter(file => file.path !== path);
        setOpenFiles(updatedFiles);

        // 닫은 탭이 현재 활성화된 파일이라면 다른 파일로 전환
        if (currentFilePath === path) {
            
            if (updatedFiles.length > 0) {
                
                // 남은 파일 중 가장 마지막 파일을 활성화
                const lastFile = updatedFiles[updatedFiles.length - 1];
                setCurrentFile(lastFile.path, lastFile.content);

            } else {

                // 열린 파일이 없으면 현재 파일 초기화
                setCurrentFile(null, null);
            }
        }

    }, [openFiles, currentFilePath, setOpenFiles, setCurrentFile]);

    return {
        handleTabClick,
        handleCloseTab
    };
}