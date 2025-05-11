import '@testing-library/jest-dom';

// 전역 mock 설정
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// fflate 모듈 모킹
jest.mock('fflate', () => ({
    unzip: jest.fn((data, callback) => {
        // 테스트용 목 데이터
        callback(null, {
            'test.txt': new Uint8Array([116, 101, 115, 116]), 
            'folder/nested.txt': new Uint8Array([110, 101, 115, 116, 101, 100])
        });
    }),
    zip: jest.fn((data, callback) => {
        // 테스트용 목 ZIP 데이터
        callback(null, new Uint8Array([1, 2, 3, 4])); 
    })
}));