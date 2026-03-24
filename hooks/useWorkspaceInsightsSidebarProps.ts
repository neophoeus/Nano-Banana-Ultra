import { useMemo } from 'react';
import WorkspaceInsightsSidebar from '../components/WorkspaceInsightsSidebar';

type WorkspaceInsightsSidebarProps = React.ComponentProps<typeof WorkspaceInsightsSidebar>;

export function useWorkspaceInsightsSidebarProps(args: WorkspaceInsightsSidebarProps) {
    return useMemo(() => args, [args]);
}
