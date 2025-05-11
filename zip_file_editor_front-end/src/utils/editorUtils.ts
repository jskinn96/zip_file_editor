/**
 * g 파일 확장자에 따른 Monaco 언어 결정
*/
export const getMonacoLanguage = (fileName: string): string => {

    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    switch (ext) {
        case 'js':
            return 'javascript';
        case 'ts':
            return 'typescript';
        case 'jsx':
            return 'javascript';
        case 'tsx':
            return 'typescript';
        case 'html':
        case 'htm':
            return 'html';
        case 'css':
            return 'css';
        case 'scss':
        case 'sass':
            return 'scss';
        case 'json':
            return 'json';
        case 'md':
        case 'markdown':
            return 'markdown';
        case 'xml':
        case 'svg':
            return 'xml';
        case 'py':
            return 'python';
        case 'java':
            return 'java';
        case 'c':
        case 'cpp':
        case 'h':
        case 'hpp':
            return 'cpp';
        case 'cs':
            return 'csharp';
        case 'go':
            return 'go';
        default:
            return 'plaintext';
    }
};

/**
 * g 파일 경로에서 파일명 추출하기
*/
export const getFilenameFromPath = (path: string): string => {
    
    return path.split('/').pop() || path;
};
