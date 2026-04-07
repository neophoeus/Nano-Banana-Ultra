import { expect, test } from '@playwright/test';

const legacySharedSnapshot = {
    history: [
        {
            id: 'legacy-turn',
            url: 'https://example.com/legacy.png',
            prompt: 'Legacy restore should not win',
            aspectRatio: '1:1',
            size: '2K',
            style: 'None',
            model: 'gemini-3.1-flash-image-preview',
            createdAt: 10,
            status: 'success',
        },
    ],
    stagedAssets: [],
    workflowLogs: [],
    queuedJobs: [],
    workspaceSession: {
        activeResult: null,
        continuityGrounding: null,
        continuitySessionHints: null,
        provenanceMode: null,
        provenanceSourceHistoryId: null,
        conversationId: null,
        conversationBranchOriginId: null,
        conversationActiveSourceHistoryId: null,
        conversationTurnIds: [],
        source: null,
        sourceHistoryId: null,
        sourceLineageAction: null,
        updatedAt: null,
    },
    branchState: {
        nameOverrides: {},
        continuationSourceByBranchOriginId: {},
    },
    conversationState: {
        byBranchOriginId: {},
    },
    viewState: {
        generatedImageUrls: [],
        selectedImageIndex: 0,
        selectedHistoryId: null,
    },
    composerState: {
        prompt: 'Legacy restore should not win',
        aspectRatio: '1:1',
        imageSize: '2K',
        imageStyle: 'None',
        imageModel: 'gemini-3.1-flash-image-preview',
        batchSize: 1,
        outputFormat: 'images-only',
        structuredOutputMode: 'off',
        temperature: 1,
        thinkingLevel: 'minimal',
        includeThoughts: true,
        googleSearch: false,
        imageSearch: false,
        generationMode: 'Text to Image',
        executionMode: 'single-turn',
    },
};

test('late shared snapshot restore does not overwrite a live draft', async ({ page }) => {
    let sharedSnapshotReads = 0;

    await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    await page.route('**/api/workspace-snapshot', async (route, request) => {
        if (request.method() === 'POST') {
            await route.fulfill({
                status: 204,
                body: '',
            });
            return;
        }

        sharedSnapshotReads += 1;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ snapshot: legacySharedSnapshot }),
        });
    });

    await page.goto('/');

    const promptBox = page.getByRole('textbox').first();
    await expect(promptBox).toBeVisible();
    await promptBox.fill('Live draft should stay');

    await page.waitForTimeout(2600);

    await expect(promptBox).toHaveValue('Live draft should stay');
    await expect(page.getByTestId('workspace-unified-history-count')).toContainText('0 items');
    await expect(page.getByTestId('workspace-unified-history-branches')).toContainText('0 branches');
    await expect(page.getByText('Legacy restore should not win')).toHaveCount(0);
    expect(sharedSnapshotReads).toBeGreaterThan(0);
});
