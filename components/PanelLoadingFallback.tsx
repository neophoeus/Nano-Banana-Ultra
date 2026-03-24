type PanelLoadingFallbackProps = {
    label: string;
    className?: string;
};

export default function PanelLoadingFallback({ label, className }: PanelLoadingFallbackProps) {
    return (
        <div className={className || 'nbu-dashed-panel px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400'}>
            {label}
        </div>
    );
}
