import { useMemo } from 'react';
import RecentHistoryFilmstrip from '../components/RecentHistoryFilmstrip';

type RecentHistoryFilmstripProps = React.ComponentProps<typeof RecentHistoryFilmstrip>;

export function useRecentHistoryFilmstripProps(args: RecentHistoryFilmstripProps) {
    return useMemo(() => args, [args]);
}
