export default function ProgressBar({
    progress,
    duration,
    canControl,
    onSeek,
    formatTime
}) {
    const handleSeek = (e) => {
        if (!canControl) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newProgress = Math.floor(percent * duration);
        onSeek(newProgress);
    };

    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

    return (
        <div className="flex items-center gap-2 w-full">
            <span className="text-gray-400 text-xs font-medium min-w-[40px] text-right">
                {formatTime(progress)}
            </span>
            
            <div 
                className={`flex-1 h-1 bg-gray-700 rounded-full overflow-hidden group ${
                    canControl ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
                onClick={handleSeek}
            >
                <div 
                    className={`h-full bg-white rounded-full transition-all ${
                        canControl ? 'group-hover:bg-[#1DB954]' : ''
                    }`}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
            
            <span className="text-gray-400 text-xs font-medium min-w-[40px]">
                {formatTime(duration)}
            </span>
        </div>
    );
}