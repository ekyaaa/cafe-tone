import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SpotifyContext = createContext();

export function SpotifyProvider({ children }) {
    const [connectionStatus, setConnectionStatus] = useState({
        isConnected: false,
        isAdmin: false,
        canControl: false,
        loading: true,
        user: null,
        error: null,
    });

    const checkConnection = async () => {
        try {
            console.log('🔍 [Context] Checking Spotify connection...');
            const { data } = await axios.get('/api/spotify/check-connection');

            console.log('✅ [Context] Backend response:', data);

            setConnectionStatus({
                isConnected: data.is_connected,
                isAdmin: data.is_admin,
                canControl: data.can_control,
                user: data.user || null,
                loading: false,
                error: null,
            });

            console.log('👤 [Context] Connection Status:', {
                isConnected: data.is_connected,
                isAdmin: data.is_admin,
                canControl: data.can_control,
            });

        } catch (error) {
            console.error('❌ [Context] Error checking Spotify connection:', error);
            setConnectionStatus(prev => ({
                ...prev,
                loading: false,
                error: error.message || 'Connection error',
            }));
        }
    };

    useEffect(() => {
        checkConnection();

        // Refresh setiap 30 detik
        const interval = setInterval(checkConnection, 30000);

        return () => clearInterval(interval);
    }, []);

    const connectSpotify = () => {
        window.location.href = '/spotify/login';
    };

    const disconnectSpotify = async () => {
        try {
            await axios.post('/spotify/disconnect');
            await checkConnection();
        } catch (error) {
            console.error('❌ [Context] Error disconnecting Spotify:', error);
        }
    };

    const value = {
        ...connectionStatus,
        connectSpotify,
        disconnectSpotify,
        refreshConnection: checkConnection,
    };

    return (
        <SpotifyContext.Provider value={value}>
            {children}
        </SpotifyContext.Provider>
    );
}

export function useSpotifyConnection() {
    const context = useContext(SpotifyContext);
    if (!context) {
        throw new Error('useSpotifyConnection must be used within SpotifyProvider');
    }
    return context;
}