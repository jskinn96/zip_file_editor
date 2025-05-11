import { useState, useEffect, useRef } from 'react';
import { isTextFile, isImageFile, getImageMimeType } from '@/utils/zipUtils';

interface UseFilePreviewProps {
    currentFilePath: string | null;
    currentFileContent: string | null;
    unzippedFiles: Record<string, Uint8Array> | null;
    safeDisposeEditor: () => void;
}

/**
 * g 파일 미리보기
*/
export function useFilePreview({
    currentFilePath,
    currentFileContent,
    unzippedFiles,
    safeDisposeEditor
}: UseFilePreviewProps) {

    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const processedImagePathRef = useRef<string | null>(null);

    // 파일 변경 (이미지, 텍스트, 바이너리 비교)
    useEffect(() => {
        
        // 초기 로딩 또는 currentFilePath가 변경되었을 때만 실행
        if (!currentFilePath || !currentFileContent) {
            
            if (imageUrl) {
                
                URL.revokeObjectURL(imageUrl);
                setImageUrl(null);
            }

            return;
        }

        // 이미지 파일 처리
        if (isImageFile(currentFilePath) && unzippedFiles) {
            
            // 이미 같은 이미지 파일을 처리중이라면 스킵
            if (processedImagePathRef.current === currentFilePath && imageUrl) return;
            
            const content = unzippedFiles[currentFilePath];
            if (content) {

                // 이전 URL 해제
                if (imageUrl) URL.revokeObjectURL(imageUrl);
                
                const blob = new Blob([content], { type: getImageMimeType(currentFilePath) });
                const newImageUrl = URL.createObjectURL(blob);

                // 현재 처리중인 이미지 경로 저장
                processedImagePathRef.current = currentFilePath;

                setImageUrl(newImageUrl);

                // Monaco Editor 있으면 제거
                safeDisposeEditor();
            }

            return;
        }

        // 파일 타입이 변경되었으면 처리 중인 이미지 경로 리셋
        processedImagePathRef.current = null;

        if (!isTextFile(currentFilePath)) {

            safeDisposeEditor();

            if (imageUrl) {

                URL.revokeObjectURL(imageUrl);
                setImageUrl(null);
            }

        } else if (imageUrl) { // 텍스트 파일인 경우 이미지 URL만 정리
            
            URL.revokeObjectURL(imageUrl);
            setImageUrl(null);
        }

    }, [currentFilePath, currentFileContent, unzippedFiles, imageUrl, safeDisposeEditor]);

    // 이미지 URL 정리를 위한 클린업
    useEffect(() => {

        return () => {
            
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };

    }, [imageUrl]);

    return {
        imageUrl,
        processedImagePathRef
    };
}