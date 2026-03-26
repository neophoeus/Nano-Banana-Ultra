import { Dispatch, ReactNode, SetStateAction, useMemo } from 'react';
import WorkspaceTopHeader from '../components/WorkspaceTopHeader';
import { Language } from '../utils/translations';

type WorkspaceTopHeaderProps = React.ComponentProps<typeof WorkspaceTopHeader>;

type UseWorkspaceTopHeaderPropsArgs = {
    headerConsole: ReactNode;
    currentLanguage: Language;
    onLanguageChange: Dispatch<SetStateAction<Language>>;
};

export function useWorkspaceTopHeaderProps({
    headerConsole,
    currentLanguage,
    onLanguageChange,
}: UseWorkspaceTopHeaderPropsArgs): WorkspaceTopHeaderProps {
    return useMemo(
        () => ({
            headerConsole,
            currentLanguage,
            onLanguageChange,
        }),
        [headerConsole, currentLanguage, onLanguageChange],
    );
}
