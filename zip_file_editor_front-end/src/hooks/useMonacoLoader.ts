import { useState, useEffect } from 'react';
import { isTextFile } from '@/utils/zipUtils';

type Monaco = typeof import('monaco-editor');

interface UseMonacoLoaderProps {
    currentFilePath: string | null;
}

/**
 * g Monaco 에디터 동적 로딩
*/
export function useMonacoLoader({ currentFilePath }: UseMonacoLoaderProps) {
    
    const [monaco, setMonaco] = useState<Monaco | null>(null);
    const [isEditorLoading, setIsEditorLoading] = useState(false);

    // Monaco 에디터 동적 로딩
    useEffect(() => {
        
        // 서버 사이드에서 실행하지 않음
        if (typeof window === 'undefined') return; 

        // 텍스트 파일이고 monaco가 아직 로드되지 않았을 때
        if (currentFilePath && isTextFile(currentFilePath) && !monaco && !isEditorLoading) {
            
            setIsEditorLoading(true);

            // Monaco Editor 동적 임포트
            import('monaco-editor').then((monacoModule) => {
                
                setMonaco(monacoModule);
                setIsEditorLoading(false);

            }).catch(err => {

                console.error('Monaco Editor 로드 오류:', err);
                setIsEditorLoading(false);
            });
        }
        
    }, [currentFilePath, monaco, isEditorLoading]);

    return {
        monaco,
        isEditorLoading
    };
}
