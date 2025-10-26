import { Link } from '@inertiajs/react';

export default function Sidebar({ currentRoute = 'home' }) {
    const playlists = [
        { id: 'liked', name: 'Liked Music', icon: '🎵' },
        { id: '1', name: 'Kemis' },
        { id: '2', name: 'Sabtu' },
        { id: '3', name: 'Rabu' },
        { id: '4', name: 'cover' },
        { id: '5', name: 'Jumat' },
        { id: '6', name: 'Selasa' },
        { id: '7', name: 'Senin' },
        { id: '8', name: 'Muted Jazz' },
        { id: '9', name: 'Episodes for Later' }
    ];

    return (
        <div className="fixed left-0 top-0 w-60 h-[calc(100vh-72px)] bg-[#0a0a0a] p-4 overflow-y-auto z-30">
            <div className="flex items-center mb-8">
                <div className="bg-red-600 rounded-full p-2 mr-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                </div>
                <span className="text-xl font-semibold text-white">Music</span>
            </div>

            <nav className="space-y-1">
                <Link 
                    href="/" 
                    className={`flex items-center px-4 py-3 rounded-lg transition ${
                        currentRoute === 'home' 
                            ? 'bg-[#282828] text-white' 
                            : 'hover:bg-[#282828] text-gray-400 hover:text-white'
                    }`}
                >
                    <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    <span>Home</span>
                </Link>
                <Link 
                    href="/explore" 
                    className={`flex items-center px-4 py-3 rounded-lg transition ${
                        currentRoute === 'explore' 
                            ? 'bg-[#282828] text-white' 
                            : 'hover:bg-[#282828] text-gray-400 hover:text-white'
                    }`}
                >
                    <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    <span>Explore</span>
                </Link>
                <Link 
                    href="/library" 
                    className={`flex items-center px-4 py-3 rounded-lg transition ${
                        currentRoute === 'library' 
                            ? 'bg-[#282828] text-white' 
                            : 'hover:bg-[#282828] text-gray-400 hover:text-white'
                    }`}
                >
                    <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>
                    </svg>
                    <span>Library</span>
                </Link>
                <a 
                    href="/spotify/login" 
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition"
                >
                    <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                    <span>Upgrade</span>
                </a>
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-800">
                <h3 className="px-4 mb-2 text-sm font-semibold text-gray-400">PLAYLISTS</h3>
                <div className="space-y-1">
                    {playlists.map((playlist) => (
                        <Link 
                            key={playlist.id}
                            href={`/playlist/${playlist.id}`} 
                            className="block px-4 py-2 rounded-lg hover:bg-[#282828] text-gray-400 hover:text-white transition truncate"
                        >
                            {playlist.icon && <span className="text-green-500 mr-2">{playlist.icon}</span>}
                            {playlist.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
