import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function HomeUser({ auth }) {
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = [
        'Podcasts', 'Feel good', 'Sad', 'Relax', 'Commute', 
        'Sleep', 'Romance', 'Energize', 'Workout', 'Party', 'Focus'
    ];

    // Listen again data
    const listenAgain = [
        {
            id: 1,
            title: "Matthew Ifield - Valentine (Lauv Cover)",
            artist: "Matthew Ifield",
            views: "723K views",
            thumbnail: "https://i.ytimg.com/vi/KbDNP9R23h4/hqdefault.jpg",
            type: "video"
        },
        {
            id: 2,
            title: "Lotus",
            artist: "Oevadohra, Wiama & Galdive",
            views: "931K views",
            thumbnail: "https://i.ytimg.com/vi/VGz4QvHXGKo/hqdefault.jpg",
            type: "video"
        },
        {
            id: 3,
            title: "Best of lofi hip hop 2021 ✨ [beats to relax/study to]",
            artist: "Lofi Girl",
            duration: "3 hr 24 min left",
            thumbnail: "https://i.ytimg.com/vi/lTRiuFIWV54/hqdefault.jpg",
            type: "playlist"
        },
        {
            id: 4,
            title: "Juwita Malam",
            artist: "Memea",
            views: "Song",
            thumbnail: "https://i.scdn.co/image/ab67616d0000b273f7b7e6f1f1f1f1f1f1f1f1f1",
            type: "song"
        }
    ];

    // Forgotten favorites data
    const forgottenFavorites = [
        {
            id: 1,
            title: "Sebuah Lagu",
            artist: "Payung Teduh",
            views: "494K views",
            thumbnail: "https://i.ytimg.com/vi/5wKV8o1jM5M/hqdefault.jpg",
            type: "video"
        },
        {
            id: 2,
            title: "Ichiko Aoba - covers ii (Bootleg, 2022)",
            artist: "mina's b-sides",
            views: "503K views",
            thumbnail: "https://i.scdn.co/image/ab67616d0000b273a1b2c3d4e5f6g7h8i9j0k1l2",
            type: "album"
        },
        {
            id: 3,
            title: "Payung Teduh - Nanti (Live Session)",
            artist: "Payung Teduh",
            views: "176K views",
            thumbnail: "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
            type: "video"
        },
        {
            id: 4,
            title: "Different Masks For Different Days",
            artist: "FKJ",
            views: "3.6M views",
            thumbnail: "https://i.scdn.co/image/ab67616d0000b273xyz789",
            type: "song"
        }
    ];

    // Today's Indonesian Hits
    const indonesianHits = [
        {
            id: 1,
            title: "Lathi",
            artist: "Weird Genius ft. Sara Fajira",
            thumbnail: "https://i.scdn.co/image/ab67616d0000b2731",
            isPlaying: false
        },
        {
            id: 2,
            title: "Risalah Hati",
            artist: "Dewa 19",
            thumbnail: "https://i.scdn.co/image/ab67616d0000b2732",
            isPlaying: false
        },
        {
            id: 3,
            title: "The Hit List",
            artist: "Playlist • Spotify",
            thumbnail: "https://i.scdn.co/image/ab67616d0000b2733",
            isPlaying: false
        },
        {
            id: 4,
            title: "Komang",
            artist: "Raim Laode",
            thumbnail: "https://i.scdn.co/image/ab67616d0000b2734",
            isPlaying: false
        },
        {
            id: 5,
            title: "Habibi",
            artist: "Senorita Project",
            thumbnail: "https://i.scdn.co/image/ab67616d0000b2735",
            isPlaying: false
        },
        {
            id: 6,
            title: "Halu",
            artist: "Feby Putri",
            thumbnail: "https://i.scdn.co/image/ab67616d0000b2736",
            isPlaying: false
        }
    ];

    const MusicCard = ({ item, showPlayButton = false }) => (
        <div className="group relative bg-[#282828] rounded-lg overflow-hidden hover:bg-[#3e3e3e] transition-all duration-300 cursor-pointer">
            <div className="relative aspect-video">
                <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
                {showPlayButton && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-white text-black rounded-full p-4 hover:scale-110 transition-transform">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 className="font-medium text-white truncate mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400 truncate">{item.artist}</p>
                <p className="text-xs text-gray-500 mt-1">{item.views || item.duration}</p>
            </div>
        </div>
    );

    const AlbumCard = ({ item }) => (
        <div className="group relative cursor-pointer">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-[#282828] mb-3">
                <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white text-black rounded-full p-3 hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <h3 className="font-medium text-white truncate mb-1">{item.title}</h3>
            <p className="text-sm text-gray-400 truncate">{item.artist}</p>
        </div>
    );

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#121212] text-white">
                {/* Sidebar */}
                <div className="fixed left-0 top-0 w-60 h-full bg-[#0a0a0a] p-4 overflow-y-auto">
                    <div className="flex items-center mb-8">
                        <div className="bg-red-600 rounded-full p-2 mr-2">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                            </svg>
                        </div>
                        <span className="text-xl font-semibold">Music</span>
                    </div>

                    <nav className="space-y-1">
                        <Link href={route('user.home')} className="flex items-center px-4 py-3 rounded-lg bg-[#282828] text-white">
                            <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                            <span>Home</span>
                        </Link>
                        <Link href={route('user.explore')} className="flex items-center px-4 py-3 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition">
                            <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            <span>Explore</span>
                        </Link>
                        <Link href={route('user.library')} className="flex items-center px-4 py-3 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition">
                            <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>
                            </svg>
                            <span>Library</span>
                        </Link>
                        <a href="/spotify/login" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition">
                            <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                            </svg>
                            <span>Upgrade</span>
                        </a>
                    </nav>

                    <div className="mt-8 pt-8 border-t border-gray-800">
                        <h3 className="px-4 mb-2 text-sm font-semibold text-gray-400">PLAYLISTS</h3>
                        <div className="space-y-1">
                            <Link href="/playlist/liked" className="block px-4 py-2 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition truncate">
                                <span className="text-green-500 mr-2">🎵</span> Liked Music
                            </Link>
                            <Link href="/playlist/1" className="block px-4 py-2 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition truncate">Kemis</Link>
                            <Link href="/playlist/2" className="block px-4 py-2 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition truncate">Sabtu</Link>
                            <Link href="/playlist/3" className="block px-4 py-2 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition truncate">Rabu</Link>
                            <Link href="/playlist/4" className="block px-4 py-2 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition truncate">cover</Link>
                            <Link href="/playlist/5" className="block px-4 py-2 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition truncate">Jumat</Link>
                            <Link href="/playlist/6" className="block px-4 py-2 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition truncate">Selasa</Link>
                            <Link href="/playlist/7" className="block px-4 py-2 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition truncate">Senin</Link>
                            <Link href="/playlist/8" className="block px-4 py-2 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition truncate">Muted Jazz</Link>
                            <Link href="/playlist/9" className="block px-4 py-2 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition truncate">Episodes for Later</Link>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="ml-60 p-8">
                    {/* Header with Profile */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                    {auth?.user?.user_name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">{auth?.user?.user_name || 'User'}</p>
                                <h1 className="text-3xl font-bold">Listen again</h1>
                            </div>
                        </div>
                        <Link 
                            href="/logout" 
                            method="post" 
                            as="button"
                            className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition"
                        >
                            Logout
                        </Link>
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

                    {/* Listen Again Section */}
                    <div className="mb-12">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {listenAgain.map((item) => (
                                <MusicCard key={item.id} item={item} showPlayButton={true} />
                            ))}
                        </div>
                    </div>

                    {/* Forgotten Favorites Section */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">Forgotten favorites</h2>
                            <div className="flex space-x-2">
                                <button className="p-2 rounded-full hover:bg-[#282828] transition">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                                    </svg>
                                </button>
                                <button className="p-2 rounded-full hover:bg-[#282828] transition">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {forgottenFavorites.map((item) => (
                                <MusicCard key={item.id} item={item} showPlayButton={true} />
                            ))}
                        </div>
                    </div>

                    {/* Today's Indonesian Hits Section */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">Today's Indonesian Hits</h2>
                            <div className="flex space-x-2">
                                <button className="p-2 rounded-full hover:bg-[#282828] transition">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                                    </svg>
                                </button>
                                <button className="p-2 rounded-full hover:bg-[#282828] transition">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {indonesianHits.map((item) => (
                                <AlbumCard key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
