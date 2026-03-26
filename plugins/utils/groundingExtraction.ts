export type GroundingSource = {
    title: string;
    url: string;
    imageUrl?: string;
    sourceType?: 'web' | 'image' | 'context';
};

export type GroundingSupport = {
    chunkIndices: number[];
    sourceIndices?: number[];
    segmentText?: string;
    sourceTitles?: string[];
};

export function extractGroundingSourceData(response: any): {
    sources: GroundingSource[];
    chunkToSourceIndex: Map<number, number>;
} {
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const chunks = groundingMetadata?.groundingChunks ?? [];
    const seen = new Set<string>();
    const sources: GroundingSource[] = [];
    const chunkToSourceIndex = new Map<number, number>();

    for (const [index, chunk] of chunks.entries()) {
        const web = chunk?.web;
        const image = chunk?.image;
        const retrievedContext = chunk?.retrievedContext;
        const url = image?.sourceUri || web?.uri || web?.url || retrievedContext?.uri || retrievedContext?.url;
        const title =
            image?.title || web?.title || web?.domain || retrievedContext?.title || retrievedContext?.domain || url;
        const imageUrl = image?.imageUri;
        const sourceType = image ? 'image' : web ? 'web' : retrievedContext ? 'context' : undefined;
        if (!url) {
            continue;
        }

        if (seen.has(url)) {
            const existingIndex = sources.findIndex((source) => source.url === url);
            if (existingIndex >= 0) {
                chunkToSourceIndex.set(index, existingIndex);
            }
            continue;
        }

        seen.add(url);
        sources.push({ title, url, imageUrl, sourceType });
        chunkToSourceIndex.set(index, sources.length - 1);
    }

    return { sources, chunkToSourceIndex };
}

export function extractGroundingDetails(response: any): {
    sources: GroundingSource[];
    webQueries: string[];
    imageQueries: string[];
    searchEntryPointAvailable: boolean;
    searchEntryPointRenderedContent?: string;
    supports: GroundingSupport[];
} {
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const { sources, chunkToSourceIndex } = extractGroundingSourceData(response);
    const chunks = Array.isArray(groundingMetadata?.groundingChunks) ? groundingMetadata.groundingChunks : [];
    const supports = Array.isArray(groundingMetadata?.groundingSupports)
        ? groundingMetadata.groundingSupports.map((support: any) => {
              const chunkIndices = Array.isArray(support?.groundingChunkIndices)
                  ? support.groundingChunkIndices.filter((index: unknown) => typeof index === 'number')
                  : [];
              const sourceIndices = Array.from(
                  new Set(
                      chunkIndices
                          .map((index: number) => chunkToSourceIndex.get(index))
                          .filter((index: number | undefined): index is number => typeof index === 'number'),
                  ),
              );
              const sourceTitles = chunkIndices
                  .map((index: number) => {
                      const chunk = chunks[index];
                      const image = chunk?.image;
                      const web = chunk?.web;
                      const retrievedContext = chunk?.retrievedContext;
                      return (
                          image?.title ||
                          web?.title ||
                          web?.domain ||
                          retrievedContext?.title ||
                          retrievedContext?.domain
                      );
                  })
                  .filter((title: unknown): title is string => typeof title === 'string' && title.trim().length > 0);

              return {
                  chunkIndices,
                  sourceIndices: sourceIndices.length > 0 ? sourceIndices : undefined,
                  segmentText: typeof support?.segment?.text === 'string' ? support.segment.text : undefined,
                  sourceTitles: sourceTitles.length > 0 ? Array.from(new Set(sourceTitles)) : undefined,
              };
          })
        : [];

    return {
        sources,
        webQueries: Array.isArray(groundingMetadata?.webSearchQueries)
            ? groundingMetadata.webSearchQueries.filter(
                  (query: unknown) => typeof query === 'string' && query.trim().length > 0,
              )
            : [],
        imageQueries: Array.isArray(groundingMetadata?.imageSearchQueries)
            ? groundingMetadata.imageSearchQueries.filter(
                  (query: unknown) => typeof query === 'string' && query.trim().length > 0,
              )
            : [],
        searchEntryPointAvailable: Boolean(groundingMetadata?.searchEntryPoint),
        searchEntryPointRenderedContent:
            typeof groundingMetadata?.searchEntryPoint?.renderedContent === 'string'
                ? groundingMetadata.searchEntryPoint.renderedContent
                : undefined,
        supports,
    };
}
