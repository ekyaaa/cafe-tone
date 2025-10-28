export default function MusicCard({ item, showPlayButton = false, onClick }) {
    return (
        <div 
            className="group relative bg-[#282828] rounded-lg overflow-hidden hover:bg-[#3e3e3e] transition-all duration-300 cursor-pointer"
            onClick={onClick}
        >
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
                                <path d="M8 5v14l11-7z" />
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
}