export default function PlayerControls({
    isPlaying,
    canControl,
    onTogglePlay,
    onNext,
    onPrevious,
    size = 'medium'
}) {
    const buttonSizes = {
        small: 'w-8 h-8',
        medium: 'w-10 h-10',
        large: 'w-14 h-14'
    };

    const iconSizes = {
        small: 'w-4 h-4',
        medium: 'w-5 h-5',
        large: 'w-6 h-6'
    };

    const playIconSizes = {
        small: 'w-5 h-5',
        medium: 'w-6 h-6',
        large: 'w-8 h-8'
    };

    return (
        <div className="flex items-center gap-3">
            {/* Previous Button */}
            <button
                onClick={onPrevious}
                disabled={!canControl}
                className={`${buttonSizes[size]} rounded-full flex items-center justify-center transition-all ${
                    canControl 
                        ? 'text-gray-400 hover:text-white hover:scale-110' 
                        : 'text-gray-600 cursor-not-allowed'
                }`}
                title="Previous"
            >
                <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
            </button>

            {/* Play/Pause Button */}
            <button
                onClick={onTogglePlay}
                disabled={!canControl}
                className={`${buttonSizes[size]} rounded-full flex items-center justify-center transition-all ${
                    canControl
                        ? 'bg-white text-black hover:scale-110 hover:bg-gray-100'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                title={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? (
                    <svg className={playIconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                ) : (
                    <svg className={playIconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                )}
            </button>

            {/* Next Button */}
            <button
                onClick={onNext}
                disabled={!canControl}
                className={`${buttonSizes[size]} rounded-full flex items-center justify-center transition-all ${
                    canControl 
                        ? 'text-gray-400 hover:text-white hover:scale-110' 
                        : 'text-gray-600 cursor-not-allowed'
                }`}
                title="Next"
            >
                <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
            </button>
        </div>
    );
}