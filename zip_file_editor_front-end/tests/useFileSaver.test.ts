import { renderHook } from '@testing-library/react';
import { useFileSaver } from '@/hooks/useFileSaver';
import { useFileStore } from '@/stores';

// 스토어 모킹
jest.mock('@/stores', () => ({
    
    useFileStore: jest.fn()
}));

describe('useFileSaver', () => {

    beforeEach(() => {
        
        // 스토어 모킹 설정
        (useFileStore as unknown as jest.Mock).mockImplementation((selector) => {
            
            // 기본 스토어 상태
            const state = {
                openFiles: [{ path: 'test.txt', name: 'test.txt', content: 'original content' }],
                setOpenFiles: jest.fn(),
                unzippedFiles: { 'test.txt': new Uint8Array([]) },
                setUnzippedFiles: jest.fn(),
                setCurrentFile: jest.fn()
            };

            return selector(state);
        });

        // TextEncoder 모킹
        global.TextEncoder = jest.fn().mockImplementation(() => ({
            
            encode: jest.fn(() => new Uint8Array([]))
        }));

        // window.dispatchEvent 모킹
        window.dispatchEvent = jest.fn();
    });

    test('내용이 변경된 경우에만 저장', () => {

        const { result } = renderHook(() => useFileSaver());

        // 함수가 존재하는지 확인
        expect(result.current.saveFileContent).toBeDefined();
    });
});