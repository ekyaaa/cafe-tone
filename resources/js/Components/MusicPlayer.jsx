import { useState, useRef, useEffect } from 'react';

export default function MusicPlayer() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    // Dummy data - nanti bisa diganti dengan data dari Spotify API
    const currentSong = {
        title: "あまねき - Amaneki",
        artist: "Ichiko Aoba & Sweet William",
        album: "FKJ - Moments (Part 1) Radio",
        thumbnail: "https://via.placeholder.com/80",
        duration: "4:08"
    };

    const upNextQueue = [
        { title: "Fading (feat. Amaria)", artist: "Elijah Fox", duration: "3:43" },
        { title: "Too Much", artist: "Galdive", duration: "3:13" },
        { title: "Different Masks For Different Days", artist: "FKJ", duration: "5:12" },
        { title: "Frontline", artist: "Butcher Brown", duration: "4:53" },
        { title: "WIM - Into the HONEYMOOD", artist: "WIM", duration: "13:05" },
    ];

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        // Audio control logic akan ditambahkan nanti
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (e) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        // Update audio current time
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
        }
    };

    return (
        <>
            {/* Overlay saat expanded */}
            {isExpanded && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Music Player Container */}
            <div 
                className={`fixed bottom-0 left-0 right-0 bg-[#212121] text-white transition-all duration-300 ease-in-out z-50 ${
                    isExpanded ? 'h-[calc(100vh)]' : 'h-[72px]'
                }`}
            >
                {/* Expanded View */}
                {isExpanded && (
                    <div className="h-full overflow-y-auto p-6">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Side - Album Art & Controls */}
                            <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="w-80 h-80 bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                                    <img 
                                        src={currentSong.thumbnail} 
                                        alt={currentSong.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                <div className="w-full max-w-md">
                                    <h2 className="text-2xl font-semibold text-center mb-2">{currentSong.title}</h2>
                                    <p className="text-gray-400 text-center mb-6">{currentSong.artist}</p>
                                    
                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max={duration || 248}
                                            value={currentTime}
                                            onChange={handleProgressChange}
                                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>{formatTime(currentTime)}</span>
                                            <span>{currentSong.duration}</span>
                                        </div>
                                    </div>

                                    {/* Control Buttons */}
                                    <div className="flex items-center justify-center space-x-4 mt-6">
                                        <button className="hover:bg-gray-700 p-2 rounded-full transition">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                                            </svg>
                                        </button>
                                        
                                        <button 
                                            onClick={togglePlay}
                                            className="bg-white text-black hover:bg-gray-200 p-4 rounded-full transition"
                                        >
                                            {isPlaying ? (
                                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            )}
                                        </button>
                                        
                                        <button className="hover:bg-gray-700 p-2 rounded-full transition">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z"/>
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Volume Control */}
                                    <div className="flex items-center space-x-3 mt-6">
                                        <button onClick={toggleMute} className="hover:bg-gray-700 p-2 rounded-full transition">
                                            {isMuted || volume === 0 ? (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                                </svg>
                                            )}
                                        </button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={isMuted ? 0 : volume}
                                            onChange={handleVolumeChange}
                                            className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Queue */}
                            <div className="bg-[#282828] rounded-lg p-6">
                                <div className="flex space-x-4 border-b border-gray-700 mb-4">
                                    <button className="pb-2 border-b-2 border-white font-semibold">UP NEXT</button>
                                    <button className="pb-2 text-gray-400 hover:text-white">LYRICS</button>
                                    <button className="pb-2 text-gray-400 hover:text-white">RELATED</button>
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400 mb-3">Playing from</p>
                                    <p className="font-semibold mb-4">{currentSong.album}</p>
                                    
                                    <div className="space-y-2">
                                        {upNextQueue.map((song, index) => (
                                            <div 
                                                key={index}
                                                className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700 cursor-pointer group"
                                            >
                                                <div className="w-12 h-12 bg-gray-600 rounded flex-shrink-0">
                                                    <img 
                                                        src="https://via.placeholder.com/48" 
                                                        alt={song.title}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <p className="font-medium truncate">{song.title}</p>
                                                    <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                                                </div>
                                                <span className="text-sm text-gray-400">{song.duration}</span>
                                                <button className="opacity-0 group-hover:opacity-100 hover:bg-gray-600 p-2 rounded-full">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mini Player (Always Visible) */}
                <div className={`absolute bottom-0 left-0 right-0 h-[72px] bg-[#212121] ${isExpanded ? 'border-t border-gray-700' : ''}`}>
                    <div className="h-full px-4 flex items-center justify-between">
                        {/* Left - Song Info */}
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-14 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                <img 
                                    src={currentSong.thumbnail} 
                                    alt={currentSong.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold truncate">{currentSong.title}</p>
                                <p className="text-sm text-gray-400 truncate">{currentSong.artist}</p>
                            </div>
                            <button className="hover:bg-gray-700 p-2 rounded-full transition flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Center - Controls */}
                        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl px-8">
                            <div className="flex items-center space-x-4 mb-2">
                                <button className="hover:bg-gray-700 p-2 rounded-full transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                                    </svg>
                                </button>
                                
                                <button 
                                    onClick={togglePlay}
                                    className="bg-white text-black hover:bg-gray-200 p-2 rounded-full transition"
                                >
                                    {isPlaying ? (
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    )}
                                </button>
                                
                                <button className="hover:bg-gray-700 p-2 rounded-full transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z"/>
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Progress Bar Mini */}
                            <div className="w-full flex items-center space-x-2">
                                <span className="text-xs text-gray-400 w-10 text-right">3:36</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="248"
                                    value={currentTime}
                                    onChange={handleProgressChange}
                                    className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
                                />
                                <span className="text-xs text-gray-400 w-10">4:08</span>
                            </div>
                        </div>

                        {/* Right - Extra Controls */}
                        <div className="flex items-center space-x-2 flex-1 justify-end">
                            <button className="hover:bg-gray-700 p-2 rounded-full transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                </svg>
                            </button>
                            
                            <button className="hover:bg-gray-700 p-2 rounded-full transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                                </svg>
                            </button>
                            
                            <button className="hover:bg-gray-700 p-2 rounded-full transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                                </svg>
                            </button>
                            
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="hover:bg-gray-700 p-2 rounded-full transition"
                            >
                                <svg 
                                    className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                                    fill="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}