import { getMonacoLanguage, getFilenameFromPath } from '@/utils/editorUtils';

describe('editorUtils', () => {

    describe('getMonacoLanguage', () => {
        
        test('JavaScript 파일은 javascript 언어 반환', () => {
            
            expect(getMonacoLanguage('test.js')).toBe('javascript');
        });

        test('TypeScript 파일은 typescript 언어 반환', () => {
            
            expect(getMonacoLanguage('test.ts')).toBe('typescript');
        });

        test('알 수 없는 확장자는 plaintext 반환', () => {
            
            expect(getMonacoLanguage('test.xyz')).toBe('plaintext');
        });
    });

    describe('getFilenameFromPath', () => {
        
        test('경로에서 파일명만 추출', () => {
            
            expect(getFilenameFromPath('folder/test.js')).toBe('test.js');
        });
    });
});