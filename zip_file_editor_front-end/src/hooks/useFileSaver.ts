import { useCallback } from 'react';
import { useFileStore } from '@/stores';

/**
 * g 파일 저장 관련 기능을 제공하는 훅
*/
export function useFileSaver() {

    const openFiles = useFileStore((state) => state.openFiles);
    const setOpenFiles = useFileStore((state) => state.setOpenFiles);
    const unzippedFiles = useFileStore((state) => state.unzippedFiles);
    const setUnzippedFiles = useFileStore((state) => state.setUnzippedFiles);
    const setCurrentFile = useFileStore((state) => state.setCurrentFile);
    
    /**
     * g 파일 내용을 저장하는 통합 함수
    */
    const saveFileContent = useCallback((
        content: string, 
        filePath: string, 
        source: string = '저장',
        updateCurrentFile: boolean = false 
    ) => {

        if (!content || !filePath) return false;
        
        // 현재 파일 인덱스
        const fileIndex = openFiles.findIndex(file => file.path === filePath);
        if (fileIndex === -1) return false;
        
        const oldContent = openFiles[fileIndex].content;
        
        // 내용이 변경된 경우에만 저장
        if (content !== oldContent) {
            
            const updatedFiles = [...openFiles];
            updatedFiles[fileIndex].content = content;
            setOpenFiles(updatedFiles);
            console.log(`${source}로 파일 내용 저장됨:`, filePath);
            
            if (unzippedFiles) {

                // 텍스트 Uint8Array로 변환
                const encoder = new TextEncoder();
                const contentBytes = encoder.encode(content);
                
                // 기존 unzippedFiles 복사 후 해당 경로 업데이트
                const updatedUnzippedFiles = { ...unzippedFiles };
                updatedUnzippedFiles[filePath] = contentBytes;
                
                // 전체 상태 업데이트
                setUnzippedFiles(updatedUnzippedFiles);
                console.log(`${source}로 unzippedFiles 업데이트됨:`, filePath);
                
                // Ctrl+S 저장 시에만 현재 파일 상태 업데이트
                if (updateCurrentFile) {

                    setCurrentFile(filePath, content);
                    console.log(`${source}로 현재 파일 상태 업데이트됨:`, filePath);
                }
                
                // 내용 변경 가상 이벤트
                window.dispatchEvent(new Event('file-modified'));
                
                return true;
            }
        }
        
        return false;

    }, [openFiles, unzippedFiles, setOpenFiles, setUnzippedFiles, setCurrentFile]);

    return {
        saveFileContent
    };
}
