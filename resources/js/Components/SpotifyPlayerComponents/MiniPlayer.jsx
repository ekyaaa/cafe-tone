import PlayerControls from './PlayerControls';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';

export default function MiniPlayer({
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    canControl,
    onTogglePlay,
    onNext,
    onPrevious,
    onSeek,
    onVolumeChange,
    onToggleMute,
    onExpand,
    formatTime
}) {
    return (
        <div className="h-full flex items-center justify-between px-6 max-w-[2000px] mx-auto">
            {/* Left: Track Info */}
            <div className="flex items-center gap-4 w-[30%] min-w-[200px]">
                {currentTrack ? (
                    <>
                        <div 
                            className="w-14 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            onClick={onExpand}
                        >
                            {currentTrack.thumbnail ? (
                                <img 
                                    src={currentTrack.thumbnail} 
                                    alt={currentTrack.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 cursor-pointer" onClick={onExpand}>
                            <p className="text-white font-medium truncate hover:underline">
                                {currentTrack.title}
                            </p>
                            <p className="text-gray-400 text-sm truncate hover:underline">
                                {currentTrack.artist}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-14 h-14 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">No track playing</p>
                            <p className="text-gray-600 text-sm">Start playing music</p>
                        </div>
                    </>
                )}
            </div>

            {/* Center: Controls */}
            <div className="flex flex-col items-center gap-2 w-[40%] max-w-[700px]">
                <PlayerControls
                    isPlaying={isPlaying}
                    canControl={canControl}
                    onTogglePlay={onTogglePlay}
                    onNext={onNext}
                    onPrevious={onPrevious}
                    size="medium"
                />
                
                <ProgressBar
                    progress={progress}
                    duration={duration}
                    canControl={canControl}
                    onSeek={onSeek}
                    formatTime={formatTime}
                />
            </div>

            {/* Right: Volume & Expand */}
            <div className="flex items-center justify-end gap-4 w-[30%] min-w-[200px]">
                <VolumeControl
                    volume={volume}
                    isMuted={isMuted}
                    canControl={canControl}
                    onVolumeChange={onVolumeChange}
                    onToggleMute={onToggleMute}
                />

                {/* Expand Button */}
                <button
                    onClick={onExpand}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Expand player"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </button>
            </div>
        </div>
    );
}