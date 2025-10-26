export default function LoadingState() {
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