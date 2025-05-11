import { ZipEntry } from '@/stores';
import { isImageFile } from '@/utils/zipUtils';

/**
 * g 파일 아이콘 결정
*/
export const getFileIcon = (fileName: string): string => {

    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return '📄';
    if (['html', 'htm'].includes(ext)) return '📄';
    if (['css', 'scss', 'sass'].includes(ext)) return '📄';
    if (['json'].includes(ext)) return '📄';
    if (['md'].includes(ext)) return '📄';
    if (isImageFile(fileName)) return '🖼️';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';

    return '📄';
};

/**
 * g 파일 트리 구조용 디렉토리 맵
*/
export const createDirectoryMap = (zipContent: ZipEntry[]): {
    dirMap: Map<string, ZipEntry[]>;
    rootEntries: ZipEntry[];
} => {

    // 디렉토리 트리 구성 맵
    const dirMap = new Map<string, ZipEntry[]>();

    // 최상위 항목 필터링
    const rootEntries = zipContent.filter(entry => {

        const pathParts = entry.path.split('/');
        return pathParts.length === 1 || (pathParts.length === 2 && entry.path.endsWith('/'));
    });

    // 하위 디렉토리별 항목 그룹화
    zipContent.forEach(entry => {

        if (entry.path.includes('/')) {
            
            const pathParts = entry.path.split('/');

            // 현재 항목 부모 디렉토리 경로
            let parentPath = '';
            if (entry.isDirectory) {
                
                // 디렉토리면 자신을 제외한 부모 경로
                parentPath = pathParts.slice(0, -2).join('/') + "/";

            } else {
                
                // 파일이면 마지막 부분을 제외한 경로
                parentPath = pathParts.slice(0, -1).join('/') + "/";
            }

            // 부모 경로가 있는 경우에만 처리
            if (parentPath) {

                if (!dirMap.has(parentPath)) dirMap.set(parentPath, []);
                
                dirMap.get(parentPath)?.push(entry);
            }
        }

    });

    return { dirMap, rootEntries };
};