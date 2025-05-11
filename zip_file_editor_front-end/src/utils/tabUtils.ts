import { OpenFile } from '@/stores/fileStore';

/**
 * g 동일한 파일명 체크
*/
export const hasDuplicateFilenames = (openFiles: OpenFile[]): boolean => {
    
    if (openFiles.length <= 1) return false;
    
    const filenames = openFiles.map(file => file.name);

    return new Set(filenames).size !== filenames.length;
};

/**
 * g 파일 경로에서 파일명만 추출
*/
export const getFilenameFromPath = (path: string): string => {
    
    return path.split('/').pop() || path;
};
