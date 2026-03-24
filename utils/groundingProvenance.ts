import { GroundingMetadata } from '../types';

export type GroundingAttributionOverviewRow = {
    id: 'coverage' | 'source-mix' | 'queries' | 'entry-point';
    label: string;
    value: string;
};

export type GroundingAttributionSource = NonNullable<GroundingMetadata['sources']>[number];

export type GroundingAttributionDetails = {
    uncitedSources: Array<{ source: GroundingAttributionSource; index: number }>;
    citedSourceIndexSet: Set<number>;
    citedSourceTitleSet: Set<string>;
    sourceAttributionStatusMessage: string;
    entryPointStatusMessage: string;
};

type BuildGroundingAttributionOverviewArgs = {
    grounding: GroundingMetadata | null;
    t: (key: string) => string;
};

const formatMessage = (t: (key: string) => string, key: string, ...values: string[]) =>
    values.reduce((message, value, index) => message.replace(`{${index}}`, value), t(key));

const collectCitedSourceMatches = (grounding: GroundingMetadata | null) => {
    const citedSourceIndexes = new Set<number>();
    const citedSourceTitles = new Set<string>();

    for (const bundle of grounding?.supports || []) {
        for (const sourceIndex of bundle.sourceIndices || []) {
            citedSourceIndexes.add(sourceIndex);
        }
        for (const sourceTitle of bundle.sourceTitles || []) {
            citedSourceTitles.add(sourceTitle);
        }
    }

    return {
        citedSourceIndexes,
        citedSourceTitles,
    };
};

const getEntryPointStatusValue = (grounding: GroundingMetadata | null, t: (key: string) => string) => {
    const webQueries = grounding?.webQueries || [];
    const imageQueries = grounding?.imageQueries || [];

    return grounding?.searchEntryPointRenderedContent
        ? t('groundingPanelAttributionEntryPointRendered')
        : grounding?.searchEntryPointAvailable
          ? t('groundingPanelAttributionEntryPointAvailable')
          : grounding?.enabled || webQueries.length > 0 || imageQueries.length > 0
            ? t('groundingPanelAttributionEntryPointNotReturned')
            : t('groundingPanelAttributionEntryPointNotRequested');
};

export const buildGroundingAttributionOverview = ({
    grounding,
    t,
}: BuildGroundingAttributionOverviewArgs): GroundingAttributionOverviewRow[] => {
    const sources = grounding?.sources || [];
    const webQueries = grounding?.webQueries || [];
    const imageQueries = grounding?.imageQueries || [];
    const { citedSourceIndexes, citedSourceTitles } = collectCitedSourceMatches(grounding);

    const citedSourcesCount = sources.reduce((count, source, index) => {
        return count + (citedSourceIndexes.has(index) || citedSourceTitles.has(source.title) ? 1 : 0);
    }, 0);

    const sourceTypeCounts = sources.reduce(
        (counts, source) => {
            const sourceType = source.sourceType || 'web';
            counts[sourceType] = (counts[sourceType] || 0) + 1;
            return counts;
        },
        {} as Record<string, number>,
    );

    const sourceMixParts = [
        sourceTypeCounts.web ? `${sourceTypeCounts.web} ${t('groundingPanelAttributionSourceTypeWeb')}` : null,
        sourceTypeCounts.image ? `${sourceTypeCounts.image} ${t('groundingPanelAttributionSourceTypeImage')}` : null,
        sourceTypeCounts.context
            ? `${sourceTypeCounts.context} ${t('groundingPanelAttributionSourceTypeContext')}`
            : null,
    ].filter(Boolean) as string[];

    const queryParts = [
        webQueries.length > 0 ? `${webQueries.length} ${t('groundingPanelAttributionWebQueries')}` : null,
        imageQueries.length > 0 ? `${imageQueries.length} ${t('groundingPanelAttributionImageQueries')}` : null,
    ].filter(Boolean) as string[];

    const entryPointValue = getEntryPointStatusValue(grounding, t);

    return [
        {
            id: 'coverage',
            label: t('groundingPanelAttributionCoverage'),
            value:
                sources.length > 0
                    ? formatMessage(
                          t,
                          'groundingPanelAttributionCoverageValue',
                          String(citedSourcesCount),
                          String(sources.length),
                      )
                    : t('groundingPanelAttributionNoSources'),
        },
        {
            id: 'source-mix',
            label: t('groundingPanelAttributionSourceMix'),
            value: sourceMixParts.length > 0 ? sourceMixParts.join(' · ') : t('groundingPanelAttributionNoSources'),
        },
        {
            id: 'queries',
            label: t('groundingPanelAttributionQueries'),
            value: queryParts.length > 0 ? queryParts.join(' · ') : t('groundingPanelAttributionNoQueriesShort'),
        },
        {
            id: 'entry-point',
            label: t('groundingPanelAttributionEntryPoint'),
            value: entryPointValue,
        },
    ];
};

export const buildGroundingAttributionDetails = ({
    grounding,
    t,
}: BuildGroundingAttributionOverviewArgs): GroundingAttributionDetails => {
    const sources = grounding?.sources || [];
    const { citedSourceIndexes, citedSourceTitles } = collectCitedSourceMatches(grounding);
    const citedSources = sources
        .map((source, index) => ({ source, index }))
        .filter(({ source, index }) => citedSourceIndexes.has(index) || citedSourceTitles.has(source.title));
    const uncitedSources = sources
        .map((source, index) => ({ source, index }))
        .filter(({ source, index }) => !citedSourceIndexes.has(index) && !citedSourceTitles.has(source.title));

    return {
        uncitedSources,
        citedSourceIndexSet: citedSourceIndexes,
        citedSourceTitleSet: citedSourceTitles,
        sourceAttributionStatusMessage:
            sources.length > 0
                ? formatMessage(
                      t,
                      'groundingPanelAttributionSourceStatusValue',
                      String(citedSources.length),
                      String(uncitedSources.length),
                  )
                : t('groundingPanelAttributionNoSourcesToCompare'),
        entryPointStatusMessage: formatMessage(
            t,
            'groundingPanelAttributionEntryPointStatus',
            getEntryPointStatusValue(grounding, t),
        ),
    };
};
