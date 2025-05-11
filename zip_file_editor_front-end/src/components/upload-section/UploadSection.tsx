'use client';

import styles from './UploadSection.module.css';
import { useRef } from 'react';
import { useFileStore } from '@/stores';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useZipFileUpload } from '@/hooks/useZipFileUpload';
import { useZipFileDownload } from '@/hooks/useZipFileDownload';
import { useFileChangeTracker } from '@/hooks/useFileChangeTracker';

export default function UploadSection() {

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const selectedFile = useFileStore((state) => state.selectedFile);
    const zipContent = useFileStore((state) => state.zipContent);
    const isProcessing = useFileStore((state) => state.isProcessing);
    
    const { processZipFile, validateZipFile, confirmFileOverwrite, hasModifiedRef, originalStateRef } = useZipFileUpload();
    const { handleDownload, isCreatingZip } = useZipFileDownload();
    const { hasChanges } = useFileChangeTracker(originalStateRef, hasModifiedRef);
    
    /**
     * g 파일 업로드 핸들러
    */ 
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.files && e.target.files.length > 0) {
            
            const file = e.target.files[0];

            // ZIP 파일 확인
            if (!validateZipFile(file)) {
                
                // 파일 입력 초기화
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            // 확인 후 처리
            confirmFileOverwrite(
                hasChanges,
                () => {

                    // ZIP 파일이 이미 로드되어 있는 경우에만 상태 초기화
                    const shouldReset = !!(selectedFile && zipContent);
                    processZipFile(file, shouldReset);
                },
                () => {

                    // 취소한 경우 파일 입력 초기화
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            );
        }
    };

    /**
     * g 파일 드롭 핸들러 
    */ 
    const handleFileDrop = (file: File) => {

        // ZIP 파일 확인
        if (!validateZipFile(file)) return;
        
        // 확인 후 처리
        confirmFileOverwrite(
            hasChanges,
            () => {

                // ZIP 파일이 이미 로드되어 있는 경우에만 상태 초기화
                const shouldReset = !!(selectedFile && zipContent);
                processZipFile(file, shouldReset);
            }
        );
    };

    // 드래그 앤 드롭 커스텀 훅 사용
    const {
        fullscreenDrop,
        handleDragOver,
        handleDrop
    } = useDragAndDrop({
        onDrop: handleFileDrop,
        fileTypeValidator: validateZipFile
    });

    return (
        <>
            <div className={styles.uploadSection}>
                <div className={styles.uploadContent}>
                    <input
                        type="file"
                        accept=".zip"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        className={styles.fileInput}
                        id="fileInput"
                    />
                    <div className={styles.uploadControls}>
                        <label htmlFor="fileInput" className={styles.uploadButton}>
                            Upload ZIP File
                        </label>
                        <button
                            onClick={handleDownload}
                            className={`${styles.downloadButton} ${hasChanges ? styles.activeDownload : ''}`}
                            disabled={!selectedFile || isProcessing || isCreatingZip || !hasChanges}
                            title={!hasChanges ? "변경사항이 없습니다" : "수정본 다운로드"}
                        >
                            {isCreatingZip ? 'ZIP 생성 중...' : 'Download'}
                        </button>
                        {selectedFile && !isProcessing && (
                            <span className={styles.fileName}>
                                {selectedFile.name}
                            </span>
                        )}
                        {isProcessing && (
                            <span className={styles.processingIndicator}>
                                처리 중...
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {fullscreenDrop && (
                <div
                    className={styles.fullscreenDropArea}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <div className={styles.fullscreenDropContent}>
                        <div className={styles.uploadIcon}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 7L12 14M12 7L9 10M12 7L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className={styles.fullscreenDropMessage}>
                            ZIP 파일을 여기에 드롭하세요
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}