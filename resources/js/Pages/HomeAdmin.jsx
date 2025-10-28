import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import MusicSection from '@/Components/HomeComponents/MusicSection';
import AlbumSection from '@/Components/HomeComponents/AlbumSection';
import SpotifyConnectButton from '@/Components/HomeComponents/SpotifyConnectButton';
import { useSpotifyConnection } from '@/Contexts/SpotifyContext'; // ✅ Import dulu

export default function HomeAdmin({ auth, listenAgain = [], topTracks = [], indonesianHits = [] }) {
    const [activeFilter, setActiveFilter] = useState('All');
    const { isConnected, isAdmin, loading } = useSpotifyConnection();

    // ✅ Debug props
    console.log('🏠 [HomeAdmin] Props received:', {
        listenAgain: listenAgain.length,
        topTracks: topTracks.length,
        indonesianHits: indonesianHits.length,
        isConnected,
        isAdmin,
    });

    const filters = [
        'Podcasts', 'Feel good', 'Sad', 'Relax', 'Commute',
        'Sleep', 'Romance', 'Energize', 'Workout', 'Party', 'Focus'
    ];

    const handleItemClick = (item) => {
        console.log('Item clicked:', item);
    };

    const hasData = listenAgain.length > 0 || topTracks.length > 0 || indonesianHits.length > 0;

    console.log('📊 [HomeAdmin] Has data:', hasData); // ✅ Debug hasData

    // ✅ Tambahkan loading state
    if (loading) {
        return (
            <AppLayout>
                <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Checking Spotify connection...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#121212] text-white min-w-[1200px]">
                {/* Main Content */}
                <div className="p-8">
                    {/* Header with Profile */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                    {auth?.user?.user_name?.charAt(0).toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">{auth?.user?.user_name || 'Admin'}</p>
                                <h1 className="text-3xl font-bold">Listen again</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Show Connect Button if admin and not connected */}
                            {isAdmin && !isConnected && (
                                <SpotifyConnectButton variant="compact" />
                            )}
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                                    activeFilter === filter
                                        ? 'bg-white text-black'
                                        : 'bg-[#282828] text-white hover:bg-[#3e3e3e]'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Show Large Connect Button if not connected and no data */}
                    {!isConnected && !hasData && isAdmin ? (
                        <SpotifyConnectButton variant="large" />
                    ) : hasData ? (
                        <>
                            {/* Listen Again Section */}
                            {listenAgain.length > 0 && (
                                <MusicSection
                                    title="Listen Again"
                                    items={listenAgain}
                                    showNavigation={false}
                                    onItemClick={handleItemClick}
                                />
                            )}

                            {/* Top Tracks Section */}
                            {topTracks.length > 0 && (
                                <MusicSection
                                    title="Top tracks"
                                    items={topTracks}
                                    showNavigation={true}
                                    onItemClick={handleItemClick}
                                />
                            )}

                            {/* Today's Indonesian Hits Section */}
                            {indonesianHits.length > 0 && (
                                <AlbumSection
                                    title="Today's Indonesian Hits"
                                    items={indonesianHits}
                                    showNavigation={true}
                                    onItemClick={handleItemClick}
                                />
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">
                                {isConnected 
                                    ? "No music data available. Start listening on Spotify!"
                                    : "Spotify not connected"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}