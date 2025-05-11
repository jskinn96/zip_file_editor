import { useCallback, useRef } from 'react';
import { useFileStore } from '@/stores';
import { isZipFile, readZipFile } from '@/utils/zipUtils';

/**
 * g ZIP 파일 업로드, 압축 해제, 파일 구조 분석 처리
*/
export function useZipFileUpload() {
    
    const selectedFile = useFileStore(state => state.selectedFile);
    const zipContent = useFileStore(state => state.zipContent);
    const setSelectedFile = useFileStore(state => state.setSelectedFile);
    const setZipContent = useFileStore(state => state.setZipContent);
    const setUnzippedFiles = useFileStore(state => state.setUnzippedFiles);
    const setOpenFiles = useFileStore(state => state.setOpenFiles);
    const setCurrentFile = useFileStore(state => state.setCurrentFile);
    const setError = useFileStore(state => state.setError);
    const setIsProcessing = useFileStore(state => state.setIsProcessing);
    const setExpandedDirs = useFileStore(state => state.setExpandedDirs);
    
    // 변경 감지를 위한 상태
    const hasModifiedRef = useRef(false);
    
    // 원본 상태 저장용 ref
    const originalStateRef = useRef<{
        fileCount: number;
        filePaths: string[];
    }>({
        fileCount: 0,
        filePaths: []
    });

    /**
     * g 모든 상태 초기화 함수 
    */
    const resetAllStates = useCallback(() => {

        // 변경 감지 상태 초기화
        hasModifiedRef.current = false;
        
        // FileStore 상태 초기화
        setSelectedFile(null);
        setZipContent(null);
        setUnzippedFiles(null);
        setOpenFiles([]);
        setCurrentFile(null, null);
        setError(null);
        setExpandedDirs([]);
        
        // 원본 상태 초기화
        originalStateRef.current = {
            fileCount: 0,
            filePaths: []
        };

    }, [setSelectedFile, setZipContent, setUnzippedFiles, setOpenFiles, setCurrentFile, setError, setExpandedDirs]);

    /**
     * g ZIP 파일 처리 함수 
    */ 
    const processZipFile = useCallback((file: File, shouldReset: boolean = false) => {

        // 필요한 경우 상태 초기화
        if (shouldReset) resetAllStates();
    
        // 변경 감지 상태 초기화
        hasModifiedRef.current = false;
        
        // 스토어에 파일 저장
        setSelectedFile(file);

        // ZIP 파일 컨텐츠 읽기
        readZipFile(
            file,
            () => setIsProcessing(true),
            () => setIsProcessing(false),
            (zipEntries, unzippedFiles) => {
                
                // 원본 상태 저장
                originalStateRef.current = {
                    fileCount: Object.keys(unzippedFiles).length,
                    filePaths: Object.keys(unzippedFiles)
                };
                
                // ZIP 콘텐츠 설정
                setZipContent(zipEntries);
                setUnzippedFiles(unzippedFiles);
            },
            (errorMessage) => {
                
                setError(errorMessage);
                setZipContent(null);
                setUnzippedFiles(null);
            }
        );

    }, [resetAllStates, setSelectedFile, setZipContent, setUnzippedFiles, setError, setIsProcessing]);
    
    /**
     * g 파일 업로드 검증 
    */ 
    const validateZipFile = useCallback((file: File): boolean => {

        if (!isZipFile(file)) {
            
            alert('ZIP 파일만 업로드 가능합니다.');
            return false;
        }

        return true;
    }, []);

    /**
     * g 새 파일 업로드 시 기존 작업 덮어쓰기 확인 
    */ 
    const confirmFileOverwrite = useCallback((
        hasChanges: boolean, 
        onConfirm: () => void, 
        onCancel?: () => void
    ): void => {

        // 이미 ZIP 파일이 로드되어 있는지 확인
        if (selectedFile && zipContent) {

            // 저장되지 않은 변경사항이 있으면 경고 추가
            const confirmMessage = hasChanges 
                ? '현재 ZIP 파일에 저장되지 않은 변경사항이 있습니다. 새로운 ZIP 파일을 로드하면 모든 변경사항이 사라집니다. 계속하시겠습니까?'
                : '현재 ZIP 파일을 닫고 새로운 ZIP 파일을 로드하시겠습니까?';
            
            if (window.confirm(confirmMessage)) onConfirm();
            else if (onCancel) onCancel();
            
        } else {

            // 첫 번째 파일 업로드인 경우 바로 처리
            onConfirm();
        }

    }, [selectedFile, zipContent]);

    return {
        processZipFile,
        validateZipFile,
        confirmFileOverwrite,
        resetAllStates,
        hasModifiedRef,
        originalStateRef
    };
}