import { ZipEntry } from '@/stores';
import { unzip } from 'fflate';

/**
 * g 이미지 파일인지 확인하는 함수
*/
export const isImageFile = (fileName: string): boolean => {

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    return imageExtensions.includes(ext);
};

/**
 * g 이미지 파일의 MIME 타입 반환
*/
export const getImageMimeType = (fileName: string): string => {
    
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (ext) {

        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';

        case 'png':
            return 'image/png';

        case 'gif':
            return 'image/gif';

        case 'bmp':
            return 'image/bmp';

        case 'webp':
            return 'image/webp';

        case 'svg':
            return 'image/svg+xml';

        default:
            return 'application/octet-stream';
    }
};

/**
 * g ZIP 파일인지 확인하는 함수 
*/
export const isZipFile = (file: File): boolean => {
    
    return file.name.toLowerCase().endsWith('.zip');
};

/**
 * g 텍스트 파일인지 확인하는 함수
*/
export const isTextFile = (fileName: string): boolean => {

    const textExtensions = [
        'txt', 'html', 'htm', 'css', 
        'js', 'jsx', 'ts', 'tsx',
        'json', 'xml', 'svg', 'md', 
        'markdown', 'csv', 'yml', 'yaml',
        'ini', 'conf', 'cfg', 'log', 
        'sh', 'bash', 'py', 'rb', 
        'java', 'c', 'cpp', 'h', 
        'hpp', 'cs', 'php', 'go', 
        'rs', 'swift'
    ];

    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    return textExtensions.includes(ext);
};

/**
 * g ZIP 파일을 읽고 처리
*/
export const readZipFile = (
    file: File,
    onStartProcessing: () => void,
    onFinishProcessing: () => void,
    onSuccess: (entries: ZipEntry[], unzippedFiles: Record<string, Uint8Array>) => void,
    onError: (error: string) => void
) => {

    onStartProcessing();

    // FileReader ArrayBuffer로 읽기
    const reader = new FileReader();

    reader.onload = (event) => {

        try {

            if (event.target && event.target.result) {

                const buffer = new Uint8Array(event.target.result as ArrayBuffer);
                
                // fflate ZIP 압축 해제
                unzip(buffer, (err, unzipped) => {

                    if (err) {

                        console.error('ZIP 파일 압축 해제 오류:', err);
                        onError(`ZIP 파일 압축 해제 중 오류가 발생했습니다: ${err}`);
                        onFinishProcessing();
                        return;
                    }
                    
                    try {

                        // 압축 해제 파일들 ZIP 구조 생성
                        const entries: ZipEntry[] = Object.entries(unzipped).map(([path, content]) => {

                            const isDirectory = path.endsWith('/');
                            const pathParts = path.split('/');
                            const name = pathParts[pathParts.length - 1] || (isDirectory ? pathParts[pathParts.length - 2] : path);
                            
                            return {
                                name,
                                path,
                                isDirectory,
                                size: content.length,
                                lastModified: new Date(),
                            };
                        });
                        
                        // 디렉토리, 파일 정렬
                        entries.sort((a, b) => {

                            if (a.isDirectory && !b.isDirectory) return -1;
                            if (!a.isDirectory && b.isDirectory) return 1;
                            
                            return a.path.localeCompare(b.path);
                        });
                        
                        onSuccess(entries, unzipped);

                    } catch (error) {

                        console.error('ZIP 구조 생성 오류:', error);
                        onError(`ZIP 구조를 생성하는 중 오류가 발생했습니다: ${error}`);

                    } finally {

                        onFinishProcessing();
                    }
                });
                
            } else {

                throw new Error('파일을 읽을 수 없습니다.');
            }
            
        } catch (err) {

            console.error('ZIP 파일 읽기 오류:', err);        
            onError(`ZIP 파일을 읽는 중 오류가 발생했습니다: ${err}`);
            onFinishProcessing();
        }
    };

    reader.onerror = () => {

        console.error('파일 읽기 실패');
        onError('파일 읽기에 실패했습니다.');
        onFinishProcessing();
    };

    reader.readAsArrayBuffer(file);
};