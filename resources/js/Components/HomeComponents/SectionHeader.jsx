export default function SectionHeader({ title, onPrevious, onNext }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            {(onPrevious || onNext) && (
                <div className="flex space-x-2">
                    <button 
                        onClick={onPrevious}
                        className="p-2 rounded-full hover:bg-[#282828] transition disabled:opacity-50"
                        disabled={!onPrevious}
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                    </button>
                    <button 
                        onClick={onNext}
                        className="p-2 rounded-full hover:bg-[#282828] transition disabled:opacity-50"
                        disabled={!onNext}
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}