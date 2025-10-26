import PlayerControls from './PlayerControls';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import QueuePanel from './QueuePanel';

export default function ExpandedPlayer({
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    queue,
    canControl,
    onTogglePlay,
    onNext,
    onPrevious,
    onSeek,
    onVolumeChange,
    onToggleMute,
    onPlayTrack,
    onCollapse,
    formatTime
}) {
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
                <h2 className="text-white font-semibold text-lg">Now Playing</h2>
                <button
                    onClick={onCollapse}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Minimize player"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Album Art & Info */}
                <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
                    {currentTrack ? (
                        <>
                            {/* Album Art */}
                            <div className="w-80 h-80 bg-gray-800 rounded-lg overflow-hidden shadow-2xl mb-8">
                                {currentTrack.thumbnail ? (
                                    <img 
                                        src={currentTrack.thumbnail} 
                                        alt={currentTrack.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-32 h-32 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Track Info */}
                            <div className="text-center mb-8 max-w-xl">
                                <h1 className="text-white text-3xl font-bold mb-2">
                                    {currentTrack.title}
                                </h1>
                                <p className="text-gray-400 text-lg">
                                    {currentTrack.artist}
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                    {currentTrack.album}
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="w-full max-w-2xl space-y-4">
                                <ProgressBar
                                    progress={progress}
                                    duration={duration}
                                    canControl={canControl}
                                    onSeek={onSeek}
                                    formatTime={formatTime}
                                />

                                <div className="flex items-center justify-between">
                                    <div className="w-48">
                                        {/* Placeholder for future features */}
                                    </div>

                                    <PlayerControls
                                        isPlaying={isPlaying}
                                        canControl={canControl}
                                        onTogglePlay={onTogglePlay}
                                        onNext={onNext}
                                        onPrevious={onPrevious}
                                        size="large"
                                    />

                                    <div className="w-48 flex justify-end">
                                        <VolumeControl
                                            volume={volume}
                                            isMuted={isMuted}
                                            canControl={canControl}
                                            onVolumeChange={onVolumeChange}
                                            onToggleMute={onToggleMute}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-80 h-80 bg-gray-800 rounded-lg flex items-center justify-center mb-8">
                                <svg className="w-32 h-32 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                </svg>
                            </div>
                            <h2 className="text-gray-400 text-2xl font-semibold">No track playing</h2>
                            <p className="text-gray-500 mt-2">Start playing music to see it here</p>
                        </div>
                    )}
                </div>

                {/* Right: Queue */}
                <QueuePanel 
                    queue={queue}
                    canControl={canControl}
                    onPlayTrack={onPlayTrack}
                />
            </div>
        </div>
    );
}