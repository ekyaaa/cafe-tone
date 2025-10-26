import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function SpotifyPlayer() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [player, setPlayer] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    
    // Connection states - ALL from backend
    const [isConnected, setIsConnected] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);        // ← From backend
    const [canControl, setCanControl] = useState(false);  // ← From backend
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);               // ← Store user info
    const [queue, setQueue] = useState([]);
    
    const intervalRef = useRef(null);
    const pollIntervalRef = useRef(null);

    // Check connection on mount
    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            console.log('🔍 Checking Spotify connection...');
            
            const { data } = await axios.get('/api/spotify/check-connection');
            
            console.log('✅ Backend response:', data);
            
            // Set states from BACKEND response
            setIsAdmin(data.is_admin);           // ← From id_role in database
            setCanControl(data.can_control);     // ← Admin + has token
            setIsConnected(data.is_connected);   // ← Any admin connected
            setUser(data.user);                  // ← User info

            console.log('👤 User Info:', {
                name: data.user.name,
                role: data.user.role,
                is_admin: data.is_admin,
                can_control: data.can_control,
            });

            if (data.can_control) {
                // Admin with token - initialize player
                console.log('🎛️ Initializing player (Admin with token)');
                initializePlayer();
            } else if (data.is_connected) {
                // User or admin without token - poll for updates
                console.log('👁️ Starting polling (Viewer mode)');
                startPolling();
                setIsLoading(false);
            } else {
                // No one connected
                console.log('⚠️ No Spotify connection');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('❌ Error checking connection:', error);
            setIsLoading(false);
        }
    };

    // Initialize Spotify Web Playback SDK (Admin only)
    const initializePlayer = async () => {
        try {
            console.log('🎵 Getting Spotify token...');
            const { data } = await axios.get('/api/spotify/token');
            
            console.log('✅ Token received, loading SDK...');
            
            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;
            document.body.appendChild(script);

            window.onSpotifyWebPlaybackSDKReady = () => {
                console.log('🎵 SDK Ready, creating player...');
                
                const spotifyPlayer = new window.Spotify.Player({
                    name: 'Cafe Tone Web Player',
                    getOAuthToken: cb => { cb(data.access_token); },
                    volume: 0.5
                });

                spotifyPlayer.addListener('initialization_error', ({ message }) => {
                    console.error('❌ Initialization Error:', message);
                });

                spotifyPlayer.addListener('authentication_error', ({ message }) => {
                    console.error('❌ Authentication Error:', message);
                    setIsConnected(false);
                    setCanControl(false);
                });

                spotifyPlayer.addListener('account_error', ({ message }) => {
                    console.error('❌ Account Error:', message);
                    alert('Spotify Premium required for playback control');
                });

                spotifyPlayer.addListener('ready', ({ device_id }) => {
                    console.log('✅ Player Ready! Device ID:', device_id);
                    setDeviceId(device_id);
                    setIsLoading(false);
                });

                spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                    console.warn('⚠️ Player Not Ready, Device ID:', device_id);
                });

                spotifyPlayer.addListener('player_state_changed', (state) => {
                    if (!state) {
                        console.warn('⚠️ Player state is null');
                        return;
                    }

                    console.log('🎵 Player state changed:', {
                        playing: !state.paused,
                        track: state.track_window.current_track.name,
                        position: state.position,
                    });

                    setIsPlaying(!state.paused);
                    setCurrentTrack({
                        title: state.track_window.current_track.name,
                        artist: state.track_window.current_track.artists.map(a => a.name).join(', '),
                        album: state.track_window.current_track.album.name,
                        thumbnail: state.track_window.current_track.album.images[0]?.url,
                    });
                    setProgress(state.position);
                    setDuration(state.duration);
                });

                spotifyPlayer.connect().then(success => {
                    if (success) {
                        console.log('✅ Player connected successfully!');
                    } else {
                        console.error('❌ Failed to connect player');
                    }
                });
                
                setPlayer(spotifyPlayer);
            };

        } catch (error) {
            console.error('❌ Error initializing player:', error);
            console.error('Error details:', error.response?.data);
            setIsLoading(false);
        }
    };

    // Poll playback status for regular users
    const startPolling = () => {
        const poll = async () => {
            try {
                const { data } = await axios.get('/api/spotify/current-playback');
                
                if (data && data.item) {
                    setIsPlaying(data.is_playing);
                    setCurrentTrack({
                        title: data.item.name,
                        artist: data.item.artists.map(a => a.name).join(', '),
                        album: data.item.album.name,
                        thumbnail: data.item.album.images[0]?.url,
                    });
                    setProgress(data.progress_ms);
                    setDuration(data.item.duration_ms);
                }
            } catch (error) {
                // Silently fail - admin might not be playing
                console.log('👁️ Polling (no active playback)');
            }
        };

        poll(); // Initial poll
        pollIntervalRef.current = setInterval(poll, 2000); // Poll every 2 seconds
    };

    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
            if (player) {
                player.disconnect();
            }
        };
    }, [player]);

    // Control functions (Admin only)
    const togglePlay = async () => {
        if (!canControl || !player) {
            console.warn('⚠️ Cannot control: canControl =', canControl, 'player =', !!player);
            return;
        }
        console.log('🎵 Toggling play/pause');
        await player.togglePlay();
    };

    const handleNext = async () => {
        if (!canControl || !player) {
            console.warn('⚠️ Cannot control next');
            return;
        }
        console.log('⏭️ Next track');
        await player.nextTrack();
    };

    const handlePrevious = async () => {
        if (!canControl || !player) {
            console.warn('⚠️ Cannot control previous');
            return;
        }
        console.log('⏮️ Previous track');
        await player.previousTrack();
    };

    const handleSeek = async (e) => {
        if (!canControl || !player) return;
        const newProgress = parseInt(e.target.value);
        setProgress(newProgress);
        await player.seek(newProgress);
    };

    const handleVolumeChange = async (e) => {
        if (!canControl || !player) return;
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        await player.setVolume(newVolume / 100);
    };

    const toggleMute = async () => {
        if (!canControl || !player) return;
        const newVolume = isMuted ? 50 : 0;
        setVolume(newVolume);
        setIsMuted(!isMuted);
        await player.setVolume(newVolume / 100);
    };

    const playTrack = async (uri) => {
        if (!canControl || !player || !deviceId) return;
        
        try {
            await axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                uris: [uri]
            }, {
                headers: {
                    Authorization: `Bearer ${await getAccessToken()}`
                }
            });
        } catch (error) {
            console.error('Error playing track:', error);
        }
    };

    const getAccessToken = async () => {
        const { data } = await axios.get('/api/spotify/token');
        return data.access_token;
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-[#212121] border-t border-gray-800 p-4 z-50">
                <div className="flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse"></div>
                        <p className="text-white">Loading player...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Not connected - show connect button (Admin only)
    if (!isConnected && isAdmin) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-[#212121] border-t border-gray-800 p-4 z-50">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-800 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-semibold">Connect to Spotify</p>
                            <p className="text-gray-400 text-sm">Connect your Spotify account to control music</p>
                        </div>
                    </div>
                    <a
                        href="/spotify/login"
                        className="bg-[#1DB954] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1ed760] transition-colors"
                    >
                        Connect Spotify
                    </a>
                </div>
            </div>
        );
    }

    // Not connected and not admin
    if (!isConnected && !isAdmin) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-[#212121] border-t border-gray-800 p-4 z-50">
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        <p className="text-gray-400 text-sm">Waiting for admin to connect Spotify...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Overlay saat expanded */}
            {isExpanded && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Music Player */}
            <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#181818] to-[#212121] border-t border-gray-800/50 z-50 transition-all duration-300 backdrop-blur-lg ${
                isExpanded ? 'h-[calc(100vh-64px)]' : 'h-[80px]'
            }`}>
                {!isExpanded ? (
                    // Mini Player
                    <div className="h-full flex items-center justify-between px-4">
                        {/* Left: Song Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative group">
                                <img 
                                    src={currentTrack?.thumbnail || 'https://via.placeholder.com/56'} 
                                    alt="Album" 
                                    className="w-14 h-14 rounded-lg shadow-lg"
                                />
                                {currentTrack && (
                                    <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-white font-semibold truncate hover:underline cursor-pointer">
                                    {currentTrack?.title || 'No track playing'}
                                </p>
                                <p className="text-gray-400 text-sm truncate hover:underline cursor-pointer">
                                    {currentTrack?.artist || 'Connect your Spotify'}
                                </p>
                            </div>
                            <button className="text-gray-400 hover:text-green-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                        </div>

                        {/* Center: Controls */}
                        <div className="flex-1 max-w-2xl mx-8">
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <button className="text-gray-400 hover:text-white transition-colors" title="Shuffle">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                                    </svg>
                                </button>
                                <button className="text-gray-400 hover:text-white transition-colors" onClick={handlePrevious}>
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                                    </svg>
                                </button>
                                <button 
                                    onClick={togglePlay}
                                    disabled={!currentTrack}
                                    className={`w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg ${!currentTrack && 'opacity-50 cursor-not-allowed'}`}
                                >
                                    {isPlaying ? (
                                        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    )}
                                </button>
                                <button className="text-gray-400 hover:text-white transition-colors" onClick={handleNext}>
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                                    </svg>
                                </button>
                                <button className="text-gray-400 hover:text-white transition-colors" title="Repeat">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>
                                <div className="relative flex-1 group">
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration}
                                        value={progress}
                                        onChange={handleSeek}
                                        disabled={!currentTrack}
                                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer
                                            [&::-webkit-slider-thumb]:appearance-none 
                                            [&::-webkit-slider-thumb]:w-0 
                                            [&::-webkit-slider-thumb]:h-0 
                                            [&::-webkit-slider-thumb]:rounded-full 
                                            [&::-webkit-slider-thumb]:bg-white 
                                            [&::-webkit-slider-thumb]:transition-all
                                            group-hover:[&::-webkit-slider-thumb]:w-3 
                                            group-hover:[&::-webkit-slider-thumb]:h-3
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            background: currentTrack ? `linear-gradient(to right, #1DB954 0%, #1DB954 ${(progress / duration) * 100}%, #4d4d4d ${(progress / duration) * 100}%, #4d4d4d 100%)` : '#4d4d4d'
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Right: Volume & Expand */}
                        <div className="flex items-center gap-4 flex-1 justify-end">
                            <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                                {isMuted || volume === 0 ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                    </svg>
                                ) : volume < 50 ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                    </svg>
                                )}
                            </button>
                            <div className="relative group">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer
                                        [&::-webkit-slider-thumb]:appearance-none 
                                        [&::-webkit-slider-thumb]:w-3 
                                        [&::-webkit-slider-thumb]:h-3 
                                        [&::-webkit-slider-thumb]:rounded-full 
                                        [&::-webkit-slider-thumb]:bg-white"
                                    style={{
                                        background: `linear-gradient(to right, #fff 0%, #fff ${volume}%, #4d4d4d ${volume}%, #4d4d4d 100%)`
                                    }}
                                />
                            </div>
                            <button className="text-gray-400 hover:text-white transition-colors" title="Queue">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                                </svg>
                            </button>
                            <button 
                                onClick={() => setIsExpanded(true)}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Expand"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    // Expanded Player
                    <div className="h-full p-8 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-8 h-full">
                            {/* Left: Album Art & Controls */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative group mb-8">
                                    <img 
                                        src={currentTrack?.thumbnail || 'https://via.placeholder.com/400'} 
                                        alt="Album" 
                                        className="w-96 h-96 rounded-2xl shadow-2xl transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                
                                {/* Song Info */}
                                <div className="text-center mb-8 w-full max-w-xl">
                                    <h2 className="text-4xl font-bold text-white mb-3 hover:underline cursor-pointer">
                                        {currentTrack?.title || 'No track playing'}
                                    </h2>
                                    <p className="text-xl text-gray-300 hover:underline cursor-pointer">
                                        {currentTrack?.artist || ''}
                                    </p>
                                    <p className="text-gray-400 mt-2">{currentTrack?.album || ''}</p>
                                </div>

                                {/* Controls */}
                                <div className="w-full max-w-xl">
                                    <div className="flex items-center justify-center gap-8 mb-6">
                                        <button className="text-gray-400 hover:text-white transition-colors hover:scale-110" title="Shuffle">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                                            </svg>
                                        </button>
                                        <button className="text-gray-400 hover:text-white transition-all hover:scale-110" onClick={handlePrevious}>
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={togglePlay}
                                            disabled={!currentTrack}
                                            className={`w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl ${!currentTrack && 'opacity-50 cursor-not-allowed'}`}
                                        >
                                            {isPlaying ? (
                                                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            )}
                                        </button>
                                        <button className="text-gray-400 hover:text-white transition-all hover:scale-110" onClick={handleNext}>
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                                            </svg>
                                        </button>
                                        <button className="text-gray-400 hover:text-white transition-colors hover:scale-110" title="Repeat">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="flex items-center gap-3 mb-8">
                                        <span className="text-sm text-gray-400 w-12 text-right font-medium">{formatTime(progress)}</span>
                                        <div className="relative flex-1 group">
                                            <input
                                                type="range"
                                                min="0"
                                                max={duration}
                                                value={progress}
                                                onChange={handleSeek}
                                                disabled={!currentTrack}
                                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer
                                                    [&::-webkit-slider-thumb]:appearance-none 
                                                    [&::-webkit-slider-thumb]:w-3 
                                                    [&::-webkit-slider-thumb]:h-3 
                                                    [&::-webkit-slider-thumb]:rounded-full 
                                                    [&::-webkit-slider-thumb]:bg-white 
                                                    [&::-webkit-slider-thumb]:shadow-lg
                                                    group-hover:[&::-webkit-slider-thumb]:scale-125
                                                    disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    background: currentTrack ? `linear-gradient(to right, #1DB954 0%, #1DB954 ${(progress / duration) * 100}%, #4d4d4d ${(progress / duration) * 100}%, #4d4d4d 100%)` : '#4d4d4d'
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-400 w-12 font-medium">{formatTime(duration)}</span>
                                    </div>

                                    {/* Volume */}
                                    <div className="flex items-center gap-4">
                                        <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                                            {isMuted || volume === 0 ? (
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                                </svg>
                                            ) : volume < 50 ? (
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                                </svg>
                                            )}
                                        </button>
                                        <div className="relative flex-1 group">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={volume}
                                                onChange={handleVolumeChange}
                                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer
                                                    [&::-webkit-slider-thumb]:appearance-none 
                                                    [&::-webkit-slider-thumb]:w-3 
                                                    [&::-webkit-slider-thumb]:h-3 
                                                    [&::-webkit-slider-thumb]:rounded-full 
                                                    [&::-webkit-slider-thumb]:bg-white
                                                    [&::-webkit-slider-thumb]:shadow-lg
                                                    group-hover:[&::-webkit-slider-thumb]:scale-125"
                                                style={{
                                                    background: `linear-gradient(to right, #fff 0%, #fff ${volume}%, #4d4d4d ${volume}%, #4d4d4d 100%)`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-400 w-12 text-right font-medium">{volume}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Queue */}
                            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-6 shadow-2xl">
                                <div className="flex gap-4 border-b border-gray-800 mb-4">
                                    <button className="pb-3 px-4 text-white border-b-2 border-green-500 font-semibold transition-all">
                                        Up Next
                                    </button>
                                    <button className="pb-3 px-4 text-gray-400 hover:text-white transition-all">
                                        Lyrics
                                    </button>
                                    <button className="pb-3 px-4 text-gray-400 hover:text-white transition-all">
                                        Related
                                    </button>
                                </div>
                                
                                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
                                    {queue.length > 0 ? (
                                        queue.map((track, index) => (
                                            <div 
                                                key={index}
                                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer group"
                                                onClick={() => playTrack(track.uri)}
                                            >
                                                <img 
                                                    src={track.thumbnail} 
                                                    alt={track.title}
                                                    className="w-12 h-12 rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate group-hover:text-green-500 transition-colors">
                                                        {track.title}
                                                    </p>
                                                    <p className="text-gray-400 text-sm truncate">
                                                        {track.artist}
                                                    </p>
                                                </div>
                                                <span className="text-gray-400 text-sm">
                                                    {formatTime(track.duration)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                                            </svg>
                                            <p className="text-gray-400 text-lg mb-2">Queue is empty</p>
                                            <p className="text-gray-500 text-sm">Add songs to start playing</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Collapse button */}
                        <button 
                            onClick={() => setIsExpanded(false)}
                            className="absolute bottom-6 right-6 w-12 h-12 bg-gray-800/50 backdrop-blur-lg rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all shadow-lg"
                            title="Minimize"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Spotify Premium Badge (if connected) */}
            {isConnected && (
                <div className="fixed bottom-24 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-40">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <span className="text-sm font-semibold">Premium</span>
                </div>
            )}
        </>
    );
}