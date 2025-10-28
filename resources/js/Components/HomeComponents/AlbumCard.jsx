export default function AlbumCard({ item, onClick }) {
    return (
        <div className="group relative cursor-pointer" onClick={onClick}>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-[#282828] mb-3">
                <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white text-black rounded-full p-3 hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                </div>
            </div>
            <h3 className="font-medium text-white truncate mb-1">{item.title}</h3>
            <p className="text-sm text-gray-400 truncate">{item.artist}</p>
        </div>
    );
}