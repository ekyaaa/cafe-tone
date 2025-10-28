import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSpotifyConnection } from '@/Contexts/SpotifyContext';
import MiniPlayer from './SpotifyPlayerComponents/MiniPlayer';
import ExpandedPlayer from './SpotifyPlayerComponents/ExpandedPlayer';
import LoadingState from './SpotifyPlayerComponents/LoadingState';
import ConnectPrompt from './SpotifyPlayerComponents/ConnectPrompt';
import WaitingForAdmin from './SpotifyPlayerComponents/WaitingForAdmin';

export default function SpotifyPlayer() {
    // UI States
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Playback States
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [queue, setQueue] = useState([]);
    
    // Player States
    const [player, setPlayer] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // ✅ Get connection status from Context (shared with HomeAdmin)
    const { isConnected, isAdmin, canControl, user, refreshConnection } = useSpotifyConnection();
    
    const progressIntervalRef = useRef(null);
    const pollIntervalRef = useRef(null);
    const lastProgressUpdateRef = useRef(0);

    // ========================================
    // Lifecycle: Initialize Based on Connection Status
    // ========================================
    useEffect(() => {
        console.log('🔄 [Player] Connection status changed:', { isConnected, canControl });

        if (canControl) {
            console.log('🎛️ [Player] Initializing player (Admin with token)');
            fetchLastPlayback();
            initializePlayer();
        } else if (isConnected) {
            console.log('👁️ [Player] Starting polling (Viewer mode)');
            fetchLastPlayback();
            startPolling();
            setIsLoading(false);
        } else {
            console.log('⚠️ [Player] No Spotify connection');
            setIsLoading(false);
        }
        
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            if (player) {
                player.disconnect();
            }
        };
    }, [isConnected, canControl]); // ✅ Re-run when connection status changes

    // ========================================
    // Progress Streaming Effect
    // ========================================
    useEffect(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        if (isPlaying && duration > 0) {
            console.log('▶️ Starting progress stream');
            
            progressIntervalRef.current = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + 100;
                    
                    if (newProgress >= duration) {
                        clearInterval(progressIntervalRef.current);
                        return duration;
                    }
                    
                    return newProgress;
                });
            }, 100);
        } else {
            console.log('⏸️ Stopping progress stream');
        }

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [isPlaying, duration]);

    // ========================================
    // Fetch Last Playback on Connect
    // ========================================
    const fetchLastPlayback = async () => {
        try {
            console.log('🎵 Fetching last playback...');
            const { data } = await axios.get('/api/spotify/current-playback');
            
            if (data && data.item) {
                console.log('✅ Last playback found:', data.item.name);
                
                setIsPlaying(data.is_playing);
                setCurrentTrack({
                    title: data.item.name,
                    artist: data.item.artists.map(a => a.name).join(', '),
                    album: data.item.album.name,
                    thumbnail: data.item.album.images[0]?.url,
                });
                setProgress(data.progress_ms);
                setDuration(data.item.duration_ms);
            } else {
                console.log('⚠️ No recent playback found');
                await fetchRecentlyPlayed();
            }
        } catch (error) {
            console.log('⚠️ No active playback, trying recently played...');
            await fetchRecentlyPlayed();
        }
    };

    const fetchRecentlyPlayed = async () => {
        try {
            console.log('🎵 Fetching recently played...');
            const { data } = await axios.get('/api/spotify/recently-played');
            
            if (data && data.items && data.items.length > 0) {
                const lastTrack = data.items[0].track;
                console.log('✅ Recently played found:', lastTrack.name);
                
                setIsPlaying(false);
                setCurrentTrack({
                    title: lastTrack.name,
                    artist: lastTrack.artists.map(a => a.name).join(', '),
                    album: lastTrack.album.name,
                    thumbnail: lastTrack.album.images[0]?.url,
                });
                setProgress(0);
                setDuration(lastTrack.duration_ms);
            } else {
                console.log('⚠️ No recently played tracks');
            }
        } catch (error) {
            console.error('❌ Error fetching recently played:', error);
        }
    };

    // ========================================
    // Spotify SDK: Initialize Player
    // ========================================
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

                // Error Listeners
                spotifyPlayer.addListener('initialization_error', ({ message }) => {
                    console.error('❌ Initialization Error:', message);
                });

                spotifyPlayer.addListener('authentication_error', ({ message }) => {
                    console.error('❌ Authentication Error:', message);
                    // ✅ Refresh connection status on auth error
                    refreshConnection();
                });

                spotifyPlayer.addListener('account_error', ({ message }) => {
                    console.error('❌ Account Error:', message);
                    alert('Spotify Premium required for playback control');
                });

                // Ready Listener
                spotifyPlayer.addListener('ready', ({ device_id }) => {
                    console.log('✅ Player Ready! Device ID:', device_id);
                    setDeviceId(device_id);
                    setIsLoading(false);
                    // ✅ Refresh connection status when player is ready
                    refreshConnection();
                });

                spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                    console.warn('⚠️ Player Not Ready, Device ID:', device_id);
                });

                // State Change Listener
                spotifyPlayer.addListener('player_state_changed', (state) => {
                    if (!state) return;

                    setIsPlaying(!state.paused);
                    setCurrentTrack({
                        title: state.track_window.current_track.name,
                        artist: state.track_window.current_track.artists.map(a => a.name).join(', '),
                        album: state.track_window.current_track.album.name,
                        thumbnail: state.track_window.current_track.album.images[0]?.url,
                    });
                    
                    setProgress(state.position);
                    setDuration(state.duration);
                    
                    lastProgressUpdateRef.current = Date.now();
                });

                // Connect Player
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
            setIsLoading(false);
        }
    };

    // ========================================
    // Polling: For Non-Admin Users
    // ========================================
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
                    
                    lastProgressUpdateRef.current = Date.now();
                }
            } catch (error) {
                console.log('👁️ Polling (no active playback)');
            }
        };

        poll();
        pollIntervalRef.current = setInterval(poll, 1000);
    };

    // ========================================
    // Controls: Playback Functions
    // ========================================
    const togglePlay = async () => {
        if (!canControl || !player) {
            console.warn('⚠️ Cannot control: canControl =', canControl, 'player =', !!player);
            return;
        }

        try {
            const state = await player.getCurrentState();
            
            if (!state) {
                await resumePlayback();
                return;
            }

            await player.togglePlay();
            
        } catch (error) {
            console.error('❌ Error toggling play:', error);
        }
    };

    const resumePlayback = async () => {
        try {
            await axios.post('/api/spotify/play', {
                device_id: deviceId
            });
            
        } catch (error) {
            console.error('❌ Error resuming playback:', error);
            
            if (error.response?.status === 404 || error.response?.status === 500) {
                await playRecentlyPlayed();
            }
        }
    };

    const playRecentlyPlayed = async () => {
        try {
            const { data: recentData } = await axios.get('/api/spotify/recently-played');
            
            if (recentData && recentData.items && recentData.items.length > 0) {
                const lastTrack = recentData.items[0].track;
                await playTrack(lastTrack.uri);
            } else {
                alert('No playback history found. Please start playing from Spotify app first.');
            }
            
        } catch (error) {
            console.error('❌ Error playing recently played:', error);
            alert('Unable to start playback. Please play something from Spotify app first.');
        }
    };

    const playTrack = async (uri) => {
        if (!canControl || !player || !deviceId) return;
        
        try {
            await axios.post('/api/spotify/play', {
                device_id: deviceId,
                uris: [uri]
            });
            
        } catch (error) {
            console.error('❌ Error playing track:', error);
            
            if (error.response?.status === 404) {
                alert('Device not found. Please refresh the page.');
            } else if (error.response?.status === 403) {
                alert('Spotify Premium required for playback control.');
            } else {
                alert('Failed to play track: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleNext = async () => {
        if (!canControl || !player) return;
        
        try {
            const state = await player.getCurrentState();
            if (!state) return;
            
            await player.nextTrack();
        } catch (error) {
            console.error('❌ Error next track:', error);
        }
    };

    const handlePrevious = async () => {
        if (!canControl || !player) return;
        
        try {
            const state = await player.getCurrentState();
            if (!state) return;
            
            await player.previousTrack();
        } catch (error) {
            console.error('❌ Error previous track:', error);
        }
    };

    const handleSeek = async (newProgress) => {
        if (!canControl || !player) return;
        
        try {
            setProgress(newProgress);
            await player.seek(newProgress);
            lastProgressUpdateRef.current = Date.now();
        } catch (error) {
            console.error('❌ Error seeking:', error);
        }
    };

    const handleVolumeChange = async (newVolume) => {
        if (!canControl || !player) return;
        
        try {
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
            await player.setVolume(newVolume / 100);
        } catch (error) {
            console.error('❌ Error changing volume:', error);
        }
    };

    const toggleMute = async () => {
        if (!canControl || !player) return;
        
        try {
            const newVolume = isMuted ? 50 : 0;
            setVolume(newVolume);
            setIsMuted(!isMuted);
            await player.setVolume(newVolume / 100);
        } catch (error) {
            console.error('❌ Error toggling mute:', error);
        }
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // ========================================
    // Render States
    // ========================================
    if (isLoading) {
        return <LoadingState />;
    }

    if (!isConnected && isAdmin) {
        return <ConnectPrompt />;
    }

    if (!isConnected && !isAdmin) {
        return <WaitingForAdmin />;
    }

    // ========================================
    // Main Player Render
    // ========================================
    return (
        <>
            {/* Overlay when expanded */}
            {isExpanded && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Player Container */}
            <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#181818] to-[#212121] border-t border-gray-800/50 z-50 transition-all duration-300 backdrop-blur-lg ${
                isExpanded ? 'h-[calc(100vh-64px)]' : 'h-[80px]'
            }`}>
                {!isExpanded ? (
                    <MiniPlayer
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        progress={progress}
                        duration={duration}
                        volume={volume}
                        isMuted={isMuted}
                        canControl={canControl}
                        onTogglePlay={togglePlay}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onSeek={handleSeek}
                        onVolumeChange={handleVolumeChange}
                        onToggleMute={toggleMute}
                        onExpand={() => setIsExpanded(true)}
                        formatTime={formatTime}
                    />
                ) : (
                    <ExpandedPlayer
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        progress={progress}
                        duration={duration}
                        volume={volume}
                        isMuted={isMuted}
                        queue={queue}
                        canControl={canControl}
                        onTogglePlay={togglePlay}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onSeek={handleSeek}
                        onVolumeChange={handleVolumeChange}
                        onToggleMute={toggleMute}
                        onPlayTrack={playTrack}
                        onCollapse={() => setIsExpanded(false)}
                        formatTime={formatTime}
                    />
                )}
            </div>

            {/* Connected Badge */}
            {isConnected && (
                <div className="fixed bottom-24 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-40">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <span className="text-sm font-semibold">
                        {canControl ? '🎛️ Controller' : '👁️ Viewer'} ({user?.name})
                    </span>
                </div>
            )}
        </>
    );
}