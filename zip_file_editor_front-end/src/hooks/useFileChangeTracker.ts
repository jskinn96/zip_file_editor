import { useState, useEffect, useRef } from 'react';
import { useFileStore } from '@/stores';

/**
 * g 파일 변경 여부 감지하여 다운로드 버튼 활성화 관리
*/
export function useFileChangeTracker(
    originalStateRef: React.RefObject<{
        fileCount: number;
        filePaths: string[];
    }>,
    hasModifiedRef?: React.RefObject<boolean>
) {

    const [hasChanges, setHasChanges] = useState(false);
    const internalModifiedRef = useRef(false);
    
    const modifiedRef = hasModifiedRef || internalModifiedRef;
    
    const zipContent = useFileStore(state => state.zipContent);
    const unzippedFiles = useFileStore(state => state.unzippedFiles);
    
    // 파일 변경 감지
    useEffect(() => {

        /**
         * g 파일 변경 감지 함수
        */
        const handleFileModified = () => {

            modifiedRef.current = true;
            setHasChanges(true);
        };
        
        // 전역 이벤트로 파일 변경 감지
        window.addEventListener('file-modified', handleFileModified);
        
        return () => {
            window.removeEventListener('file-modified', handleFileModified);
        };

    }, [modifiedRef]);
    
    // 파일 수, 경로 변경 감지
    useEffect(() => {

        if (!unzippedFiles || !zipContent) {
            
            setHasChanges(false);
            return;
        }
        
        // 이미 변경된 것이면 다시 검사할 필요 없음
        if (modifiedRef.current) return;
        
        const currentFilePaths = Object.keys(unzippedFiles);
        
        // 파일 개수 변경 확인
        if (currentFilePaths.length !== originalStateRef.current.fileCount) {

            setHasChanges(true);
            return;
        }
        
        // 파일 추가/삭제 확인
        const pathsChanged = currentFilePaths.some(path => 
            
            !originalStateRef.current.filePaths.includes(path)
        ) 
        || originalStateRef.current.filePaths.some(path => 
            
            !currentFilePaths.includes(path)
        );
        
        if (pathsChanged) {
            
            setHasChanges(true);
            return;
        }
        
        setHasChanges(false);

    }, [unzippedFiles, zipContent, originalStateRef, modifiedRef]);
    
    return { 
        hasChanges, 
        setHasChanges 
    };
}