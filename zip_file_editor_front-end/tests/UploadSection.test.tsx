import React from 'react';
import { render, screen } from '@testing-library/react';
import UploadSection from '@/components/upload-section/UploadSection';
import { useFileStore } from '@/stores';

// 스토어 모킹
jest.mock('@/stores', () => ({

    useFileStore: jest.fn()
}));

// 필요한 훅들 모킹
jest.mock('@/hooks/useZipFileUpload', () => ({
    
    useZipFileUpload: jest.fn(() => ({
        processZipFile: jest.fn(),
        validateZipFile: jest.fn(() => true),
        confirmFileOverwrite: jest.fn(),
        hasModifiedRef: { current: false },
        originalStateRef: { current: { fileCount: 0, filePaths: [] } }
    }))
}));

jest.mock('@/hooks/useZipFileDownload', () => ({
   
    useZipFileDownload: jest.fn(() => ({
        handleDownload: jest.fn(),
        isCreatingZip: false
    }))
}));

jest.mock('@/hooks/useFileChangeTracker', () => ({
    
    useFileChangeTracker: jest.fn(() => ({
        hasChanges: false
    }))
}));

jest.mock('@/hooks/useDragAndDrop', () => ({
    
    useDragAndDrop: jest.fn(() => ({
        fullscreenDrop: false,
        handleDragOver: jest.fn(),
        handleDrop: jest.fn()
    }))
}));

describe('UploadSection', () => {
    
    beforeEach(() => {
        
        // 기본 스토어 상태 설정
        (useFileStore as unknown as jest.Mock).mockImplementation((selector) => {
            
            const state = {
                selectedFile: null,
                zipContent: null,
                isProcessing: false
            };

            return selector(state);
        });
    });

    test('업로드 버튼이 표시됨', () => {
        
        render(<UploadSection />);
        expect(screen.getByText('Upload ZIP File')).toBeInTheDocument();
    });

    test('ZIP 파일이 선택되지 않았을 때 다운로드 버튼이 비활성화', () => {
        
        render(<UploadSection />);
        expect(screen.getByText('Download')).toBeDisabled();
    });
});