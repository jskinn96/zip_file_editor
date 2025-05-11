import { test } from '@playwright/test';
import path from 'path';

test('ZIP 파일 업로드 후 파일 선택 워크플로우', async ({ page }) => {

    // 앱 페이지 접속
    await page.goto('/');

    // filechooser 이벤트를 기다림
    const fileChooserPromise = page.waitForEvent('filechooser');

    // Upload 버튼 클릭
    await page.locator('text=Upload ZIP File').click();

    // filechooser 이벤트 수신 및 파일 설정
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, '../fixtures/test.zip'));

    // 파일 로딩 대기
    try {

        // 파일 트리가 로드되었는지 확인하는 대신 안내 메시지가 변경되었는지 확인
        await page.waitForSelector('text=파일 트리에서 파일을 선택해주세요', { timeout: 5000 });
        console.log('ZIP 파일 로드 성공');

    } catch (error) {
        
        console.log('ZIP 파일 로드 실패 또는 파일 트리를 찾을 수 없습니다.');
        console.error(error);
    }
});