import { useState, useCallback } from 'react';
import { useFileStore } from '@/stores';
import { zip } from 'fflate';

/**
 * g 수정된 파일을 ZIP으로 압축하여 다운로드
*/
export function useZipFileDownload() {

    const [isCreatingZip, setIsCreatingZip] = useState(false);

    const selectedFile = useFileStore(state => state.selectedFile);
    const unzippedFiles = useFileStore(state => state.unzippedFiles);
    
    /**
     * g 다운로드 처리 함수 
    */ 
    const handleDownload = useCallback(async () => {

        if (!selectedFile || !unzippedFiles) return;
        
        setIsCreatingZip(true);
        
        try {

            // 수정된 파일들로 새 ZIP 생성
            zip(unzippedFiles, (err, zipData) => {
                
                if (err) {

                    console.error('ZIP 생성 오류:', err);
                    alert('수정된 ZIP 파일을 생성하는 데 실패했습니다.');
                    setIsCreatingZip(false);
                    return;
                }
                
                // ZIP 데이터를 Blob으로 변환
                const blob = new Blob([zipData], { type: 'application/zip' });
                
                // 다운로드 링크 생성
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                
                // 파일명에 '_modified' 추가
                const originalName = selectedFile.name;
                const nameParts = originalName.split('.');
                const extension = nameParts.pop() || 'zip';
                const baseName = nameParts.join('.');
                const newFileName = `${baseName}_modified.${extension}`;
                
                a.href = url;
                a.download = newFileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setIsCreatingZip(false);
            });

        } catch (error) {

            console.error('압축 파일 생성 중 오류:', error);
            alert('압축 파일 생성 중 오류가 발생했습니다.');
            setIsCreatingZip(false);
        }
        
    }, [selectedFile, unzippedFiles]);

    return { 
        handleDownload, 
        isCreatingZip 
    };
}