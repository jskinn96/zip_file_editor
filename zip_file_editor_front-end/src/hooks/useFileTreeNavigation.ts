import { useState } from 'react';
import { useFileStore, ZipEntry } from '@/stores';
import { isTextFile } from '@/utils/zipUtils';

/**
 * g 파일 트리 탐색, 선택, 디렉토리 확장/축소 처리
*/
export function useFileTreeNavigation() {

    const [navigationError, setError] = useState<string | null>(null);

    const unzippedFiles = useFileStore(state => state.unzippedFiles);
    const setUnzippedFiles = useFileStore(state => state.setUnzippedFiles);
    const setCurrentFile = useFileStore(state => state.setCurrentFile);
    const expandedDirs = useFileStore(state => state.expandedDirs);
    const setExpandedDirs = useFileStore(state => state.setExpandedDirs);
    const zipContent = useFileStore(state => state.zipContent);

    /**
     * g 항목 클릭 핸들러 
    */ 
    const handleItemClick = (entry: ZipEntry) => {

        if (entry.isDirectory) {

            // 디렉토리 클릭 시 확장/축소 토글
            const newExpandedDirs = expandedDirs.includes(entry.path)
                ? expandedDirs.filter(path => path !== entry.path) // 이미 확장된 경우 제거
                : [...expandedDirs, entry.path]; // 없으면 추가

            setExpandedDirs(newExpandedDirs);
            
            return;
        }

        // 파일 클릭 처리
        if (!unzippedFiles) {
            
            setError('ZIP 파일이 압축 해제되지 않았습니다.');
            return;
        }

        try {

            // 이미 압축 해제된 파일 내용 사용
            const content = unzippedFiles[entry.path];

            if (!content) {

                console.log('현재 unzippedFiles 키 목록:', Object.keys(unzippedFiles));

                // 새로 생성된 파일이라면 빈 내용으로 처리
                if (zipContent && zipContent.some(item => item.path === entry.path && !item.isDirectory)) {
                    
                    console.log('새로 생성된 파일로 판단하여 빈 내용으로 처리합니다');

                    // 빈 내용으로 파일 생성
                    const emptyContentBytes = new TextEncoder().encode('');
                    const updatedUnzippedFiles = { ...unzippedFiles };
                    updatedUnzippedFiles[entry.path] = emptyContentBytes;
                    setUnzippedFiles(updatedUnzippedFiles);

                    // 빈 내용으로 에디터 열기
                    setCurrentFile(entry.path, ' ');
                    
                    return;
                }
                
                console.error(`파일 내용을 찾을 수 없습니다: ${entry.path}`);
                setError(`파일 내용을 찾을 수 없습니다: ${entry.path}`);
                return;
            }

            // 파일 내용 추출 후 콘솔에 출력
            console.log(`파일 추출 완료: ${entry.name}, 크기: ${content.length} bytes`);

            // 파일이 텍스트 파일인지 확인
            if (isTextFile(entry.name)) {

                try {
                    
                    // 텍스트 파일이면 내용을 문자열로 변환하여 텍스트 에디터에 전달
                    const textContent = new TextDecoder().decode(content);
                    
                    // 스토어에 현재 파일 내용 저장
                    setCurrentFile(entry.path, textContent);

                } catch (decodeError) {
                    
                    console.error('텍스트 디코딩 실패:', decodeError);
                    setError(`파일 디코딩 오류: ${entry.name}`);
                }

            } else {

                // 바이너리 파일은 현재 파일 경로만 설정
                setCurrentFile(entry.path, '[Binary Data]');
            }
            
        } catch (err) {

            console.error('파일 처리 오류:', err);
            setError(`파일 처리 중 오류가 발생했습니다: ${err}`);
        }
    };

    return {
        handleItemClick,
        navigationError
    };
}