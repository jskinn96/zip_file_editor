import { useState, useEffect } from 'react';

interface UseDragAndDropOptions {
    onDrop?: (file: File) => void;
    fileTypeValidator?: (file: File) => boolean;
}

/**
 *g 파일 드래그 앤 드롭 커스텀 훅
*/
export const useDragAndDrop = (options: UseDragAndDropOptions = {}) => {

    const [fullscreenDrop, setFullscreenDrop] = useState(false);
    const { onDrop, fileTypeValidator } = options;

    // 전역 드래그 이벤트 감지
    useEffect(() => {

        const handleWindowDragEnter = (e: DragEvent) => {

            e.preventDefault();

            if (e.dataTransfer && e.dataTransfer.items.length > 0) setFullscreenDrop(true);
        };

        const handleWindowDragLeave = (e: DragEvent) => {

            e.preventDefault();

            // relatedTarget이 null이면 창 밖으로 드래그가 나갔다는 의미
            if (!e.relatedTarget) setFullscreenDrop(false);
        };

        window.addEventListener('dragenter', handleWindowDragEnter);
        window.addEventListener('dragleave', handleWindowDragLeave);

        return () => {
            window.removeEventListener('dragenter', handleWindowDragEnter);
            window.removeEventListener('dragleave', handleWindowDragLeave);
        };
    }, []);

    // 드래그 오버 핸들러
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {

        e.preventDefault();
        e.stopPropagation();
    };

    // 드롭 핸들러
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {

        e.preventDefault();
        e.stopPropagation();
        
        setFullscreenDrop(false);

        const files = e.dataTransfer.files;
        
        if (files && files.length > 0) {
            
            const file = files[0];

            // 파일 유효성 체크
            if (!fileTypeValidator || fileTypeValidator(file)) {
                
                // 콜백
                if (onDrop) onDrop(file);
                
            } else alert('지원되지 않는 파일 형식입니다.');
        }
    };

    return {
        fullscreenDrop,
        setFullscreenDrop,
        handleDragOver,
        handleDrop
    };
};