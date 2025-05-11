import { create } from 'zustand';

// ZIP 파일 항목 인터페이스
export interface ZipEntry {
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
    lastModified: Date;
}

// 열린 파일 탭 인터페이스
export interface OpenFile {
    path: string;
    name: string;
    content: string;
}

interface FileState {
    // 선택된 파일
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;

    // ZIP 파일의 컨텐츠
    zipContent: ZipEntry[] | null;
    setZipContent: (content: ZipEntry[] | null) => void;

    // 압축 해제된 파일들
    unzippedFiles: Record<string, Uint8Array> | null;
    setUnzippedFiles: (files: Record<string, Uint8Array> | null) => void;

    // ZIP 파일 처리 상태
    isProcessing: boolean;
    setIsProcessing: (value: boolean) => void;

    // 오류 상태
    error: string | null;
    setError: (error: string | null) => void;

    // 선택된 파일의 내용
    currentFileContent: string | null;
    currentFilePath: string | null;
    setCurrentFile: (path: string | null, content: string | null) => void;

    // 열린 파일 목록
    openFiles: OpenFile[];
    setOpenFiles: (files: OpenFile[]) => void;
    
    // 펼쳐진 디렉토리 목록
    expandedDirs: string[];
    setExpandedDirs: (dirs: string[]) => void;
}

const useFileStore = create<FileState>((set) => ({
    selectedFile: null,
    setSelectedFile: (file) => set({ selectedFile: file }),

    zipContent: null,
    setZipContent: (content) => set({ zipContent: content }),
    
    unzippedFiles: null,
    setUnzippedFiles: (files) => set({ unzippedFiles: files }),

    isProcessing: false,
    setIsProcessing: (value) => set({ isProcessing: value }),

    error: null,
    setError: (error) => set({ error }),

    currentFileContent: null,
    currentFilePath: null,
    setCurrentFile: (path, content) => set({
        currentFilePath: path,
        currentFileContent: content
    }),

    openFiles: [],
    setOpenFiles: (files) => set({ openFiles: files }),
    
    expandedDirs: [],
    setExpandedDirs: (dirs) => set({ expandedDirs: dirs }),
}));

export default useFileStore;