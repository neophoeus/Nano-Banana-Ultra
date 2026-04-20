export type WorkspaceSecondaryNavItem = {
    id: string;
    label: string;
    onClick: () => void;
    isActive?: boolean;
    badge?: string;
};

type WorkspaceSecondaryNavProps = {
    items: WorkspaceSecondaryNavItem[];
    className?: string;
};

export default function WorkspaceSecondaryNav({ items, className = '' }: WorkspaceSecondaryNavProps) {
    if (items.length === 0) {
        return null;
    }

    const inactiveItemClassName = 'nbu-control-button px-3 py-1.5 text-[11px]';
    const activeItemClassName =
        'rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700 transition-colors dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200';

    return (
        <div
            className={`nbu-overlay-nav-shell inline-flex flex-wrap gap-2 rounded-[22px] border p-2 ${className}`.trim()}
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={item.onClick}
                    className={`${item.isActive ? activeItemClassName : inactiveItemClassName}`}
                >
                    <span>{item.label}</span>
                    {item.badge && (
                        <span className="ml-2 rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10">
                            {item.badge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
