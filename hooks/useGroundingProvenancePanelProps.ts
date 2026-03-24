import { useMemo } from 'react';
import { GroundingProvenancePanelProps } from '../components/GroundingProvenancePanel';

type UseGroundingProvenancePanelPropsArgs = Omit<GroundingProvenancePanelProps, 'tone' | 'scope'>;

export function useGroundingProvenancePanelProps(args: UseGroundingProvenancePanelPropsArgs) {
    return useMemo(() => args, [args]);
}
