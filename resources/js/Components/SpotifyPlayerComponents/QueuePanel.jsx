export default function QueuePanel({ queue, canControl, onPlayTrack }) {
    return (
        <div className="w-96 border-l border-gray-800/50 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-800/50">
                <h3 className="text-white font-semibold">Queue</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
                {queue && queue.length > 0 ? (
                    <div className="py-2">
                        {queue.map((track, index) => (
                            <button
                                key={index}
                                onClick={() => canControl && onPlayTrack(track.uri)}
                                disabled={!canControl}
                                className={`w-full px-6 py-3 flex items-center gap-3 transition-colors ${
                                    canControl 
                                        ? 'hover:bg-white/5' 
                                        : 'cursor-not-allowed opacity-50'
                                }`}
                            >
                                <div className="w-12 h-12 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                                    {track.thumbnail ? (
                                        <img 
                                            src={track.thumbnail} 
                                            alt={track.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-white text-sm font-medium truncate">
                                        {track.title}
                                    </p>
                                    <p className="text-gray-400 text-xs truncate">
                                        {track.artist}
                                    </p>
                                </div>
                                <span className="text-gray-500 text-xs">
                                    {Math.floor(track.duration / 60000)}:{String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                        <svg className="w-16 h-16 text-gray-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                        </svg>
                        <p className="text-gray-400 font-medium">Queue is empty</p>
                        <p className="text-gray-500 text-sm mt-1">Add songs to see them here</p>
                    </div>
                )}
            </div>
        </div>
    );
}