import { useCallback } from 'react';

type MonacoEditor = import('monaco-editor').editor.IStandaloneCodeEditor;

/**
 * g 에디터 안전 관련 유틸리티 훅
*/
export function useEditorUtils(editor: MonacoEditor | null, editorValidRef: React.RefObject<boolean>) {
    
    /**
     * g 에디터 내용 가져오기
    */
    const safeGetEditorContent = useCallback((): string | null => {
        
        if (editor && editorValidRef.current) {
            
            try {
                
                return editor.getValue();

            } catch (error) {
                
                console.error('에디터 값을 가져오는 중 오류 발생:', error);
                return null;
            }
        }
        
        return null;
        
    }, [editor, editorValidRef]);

    /**
     * g 에디터 초기화
    */
    const safeDisposeEditor = useCallback((setEditor: (editor: MonacoEditor | null) => void) => {
        
        if (editor && editorValidRef.current) {
            
            try {

                editor.dispose();
                editorValidRef.current = false;
                setEditor(null);

            } catch (error) {
                
                console.error('에디터 제거 중 오류:', error);
            }
        }

    }, [editor, editorValidRef]);

    return {
        safeGetEditorContent,
        safeDisposeEditor
    };
}