import { test, expect } from '@playwright/test';

test('ZIP 파일 업로드 테스트', async ({ page }) => {

    // 앱 페이지 접속
    await page.goto('/');

    // 초기 상태 확인
    await expect(page.locator('text=ZIP 파일을 업로드해주세요')).toBeVisible();

    // Upload 버튼 확인
    await expect(page.locator('text=Upload ZIP File')).toBeVisible();

    // Download 버튼이 비활성화 되어 있는지 확인
    await expect(page.locator('button:has-text("Download")')).toBeDisabled();
});