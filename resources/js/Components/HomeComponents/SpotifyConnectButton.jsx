import { useSpotifyConnection } from '@/Contexts/SpotifyContext'; // ✅ Ubah dari Hooks ke Context

export default function SpotifyConnectButton({ variant = 'default' }) {
    const { isConnected, isAdmin, canControl, loading, connectSpotify } = useSpotifyConnection();

    // Jika sudah connected, tidak perlu tampilkan button
    if (isConnected || loading) {
        return null;
    }

    // Only admin can connect
    if (!isAdmin) {
        return null;
    }

    if (variant === 'compact') {
        return (
            <button
                onClick={connectSpotify}
                className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition"
            >
                Connect Spotify
            </button>
        );
    }

    if (variant === 'large') {
        return (
            <div className="text-center py-12">
                <div className="mb-6">
                    <svg className="w-20 h-20 mx-auto text-green-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <h2 className="text-2xl font-bold mb-2">Connect Your Spotify</h2>
                    <p className="text-gray-400 mb-6">
                        Connect your Spotify account to see your personalized music recommendations and control playback
                    </p>
                </div>
                <button
                    onClick={connectSpotify}
                    className="inline-block px-8 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition"
                >
                    Connect Spotify
                </button>
            </div>
        );
    }

    // Default variant
    return (
        <button
            onClick={connectSpotify}
            className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition"
        >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span>Connect Spotify</span>
        </button>
    );
}