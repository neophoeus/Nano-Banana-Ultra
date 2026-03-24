import { useMemo } from 'react';
import WorkspacePickerSheet from '../components/WorkspacePickerSheet';

type WorkspacePickerSheetProps = React.ComponentProps<typeof WorkspacePickerSheet>;

export function useWorkspacePickerSheetProps(args: WorkspacePickerSheetProps) {
    return useMemo(() => args, [args]);
}
