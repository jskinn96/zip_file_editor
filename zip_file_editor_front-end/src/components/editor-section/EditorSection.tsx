'use client';

import styles from './EditorSection.module.css';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useFileStore } from '@/stores';
import { isTextFile, isImageFile } from '@/utils/zipUtils';
import { getMonacoLanguage, getFilenameFromPath } from '@/utils/editorUtils';
import { useEditorUtils } from '@/hooks/useEditorUtils';
import { useFilePreview } from '@/hooks/useFilePreview';
import { useFileSaver } from '@/hooks/useFileSaver';
import { useMonacoLoader } from '@/hooks/useMonacoLoader';

type MonacoEditor = import('monaco-editor').editor.IStandaloneCodeEditor;

const EditorSection = () => {

    const selectedFile = useFileStore((state) => state.selectedFile);
    const currentFilePath = useFileStore((state) => state.currentFilePath);
    const currentFileContent = useFileStore((state) => state.currentFileContent);
    const unzippedFiles = useFileStore((state) => state.unzippedFiles);

    const prevFilePathRef = useRef<string | null>(null);
    const editorValidRef = useRef<boolean>(false);
    const monacoContainerRef = useRef<HTMLDivElement>(null);
    const [editor, setEditor] = useState<MonacoEditor | null>(null);

    const { monaco, isEditorLoading } = useMonacoLoader({ currentFilePath });
    const { safeGetEditorContent, safeDisposeEditor: safeDisposeEditorFn } = useEditorUtils(editor, editorValidRef);
    const { saveFileContent } = useFileSaver();

    /**
     * g 에디터 정리
    */
    const safeDisposeEditor = useCallback(() => {

        safeDisposeEditorFn(setEditor);

    }, [safeDisposeEditorFn, setEditor]);

    // 에디터 초기화 및 클린업
    useEffect(() => {

        const currentContainer = monacoContainerRef.current;

        if (
            currentContainer &&
            monaco &&
            currentFilePath &&
            isTextFile(currentFilePath) &&
            currentFileContent !== null &&
            !editor
        ) {

            console.log('컨테이너 요소가 준비되어 에디터 초기화 시작');

            // 기존 에디터가 있으면 먼저 정리
            safeDisposeEditor();

            const language = getMonacoLanguage(currentFilePath);

            try {

                // 에디터 초기화
                const newEditor = monaco.editor.create(currentContainer, {
                    value: currentFileContent,
                    language,
                    theme: 'vs',
                    automaticLayout: true,
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    readOnly: false,
                });

                setEditor(newEditor);
                editorValidRef.current = true;
                console.log('에디터 생성 완료');

            } catch (error) {

                console.error('에디터 생성 오류:', error);
                editorValidRef.current = false;
            }
        }

        // 컴포넌트 언마운트 시 데이터 저장 및 에디터 정리
        return () => {

            // 에디터 내용 한 번만 가져오기
            const content = safeGetEditorContent();

            if (content !== null) {
                
                // 저장할 파일 경로 결정
                const targetPath = prevFilePathRef.current && prevFilePathRef.current !== currentFilePath
                    ? prevFilePathRef.current // 파일 변경 시 이전 파일 저장
                    : currentFilePath; // 언마운트 시 현재 파일 저장

                if (targetPath) saveFileContent(content, targetPath, '언마운트', false);
            }

            // 현재 파일 경로 저장
            prevFilePathRef.current = currentFilePath;

            // 에디터 및 리소스 정리
            safeDisposeEditor();
        };
    }, [
        monaco,
        currentFilePath,
        currentFileContent,
        editor,
        safeDisposeEditor,
        safeGetEditorContent,
        saveFileContent
    ]);

    // 에디터 모델 업데이트
    useEffect(() => {

        if (
            !editor 
            || !monaco 
            || !currentFilePath 
            || !isTextFile(currentFilePath) 
            || !currentFileContent 
            || !editorValidRef.current
        ) return;
        

        try {

            console.log('에디터 모델 업데이트 중...');
            const language = getMonacoLanguage(currentFilePath);

            // 모델 생성 및 설정
            const model = monaco.editor.createModel(currentFileContent, language);
            editor.setModel(model);

        } catch (error) {

            console.error('에디터 모델 업데이트 중 오류 발생:', error);
            editorValidRef.current = false;
        }

    }, [editor, monaco, currentFilePath, currentFileContent]);

    // Monaco 에디터 단축키 (Ctrl+S 저장)
    useEffect(() => {

        if (editor && monaco && editorValidRef.current && currentFilePath) {
            
            // 키 바인딩
            editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, // Ctrl+S 또는 Cmd+S
                () => {
                    
                    // 현재 에디터 내용
                    const content = safeGetEditorContent();

                    // Ctrl+S 저장 시에는 현재 파일 상태도 함께 업데이트
                    if (content !== null && currentFilePath) saveFileContent(content, currentFilePath, 'Ctrl+S', true);
                }
            );
        }

    }, [editor, monaco, currentFilePath, saveFileContent, safeGetEditorContent]);

    // 파일 미리보기
    const { imageUrl } = useFilePreview({
        currentFilePath,
        currentFileContent,
        unzippedFiles,
        safeDisposeEditor
    });

    // 메모제이션
    const renderContent = useMemo(() => {

        if (!selectedFile) {
            
            return (
                <div className={styles.editorEmpty}>
                    ZIP 파일을 업로드해주세요.
                </div>
            );
        }

        if (!currentFilePath) {
            
            return (
                <div className={styles.editorReady}>
                    파일 트리에서 파일을 선택해주세요.<br />
                    CTRL + S로 파일 저장이 가능합니다.
                </div>
            );
        }

        if (isImageFile(currentFilePath) && imageUrl) {
            
            return (
                <div className={styles.imagePreview}>
                    <Image
                        src={imageUrl}
                        alt={getFilenameFromPath(currentFilePath) || 'Image preview'}
                        fill
                        style={{ objectFit: 'contain', userSelect: 'none' }}
                        draggable={false}
                    />
                </div>
            );
        }

        if (isTextFile(currentFilePath)) {
            
            if (isEditorLoading) {
                
                return (
                    <div className={styles.editorLoading}>로딩 중...</div>
                );
            }

            if (!monaco) {
                
                return (
                    <div className={styles.editorLoading}>초기화 중...</div>
                );
            }

            return (
                <div ref={monacoContainerRef} className={styles.monacoContainer}></div>
            );
        }

        return (
            <div className={styles.binaryFile}>
                [바이너리 파일: {getFilenameFromPath(currentFilePath)}]<br />
                이 형식의 파일은 미리보기를 지원하지 않습니다.
            </div>
        );

    }, [selectedFile, currentFilePath, imageUrl, isEditorLoading, monaco]);

    return (
        <div className={styles.editorSection}>
            <div className={styles.editorContent}>
                {renderContent}
            </div>
        </div>
    );
}

export default React.memo(EditorSection);