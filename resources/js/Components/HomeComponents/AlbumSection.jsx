import SectionHeader from './SectionHeader';
import AlbumCard from './AlbumCard';

export default function AlbumSection({ title, items, showNavigation = false, onItemClick }) {
    return (
        <div className="mb-12">
            <SectionHeader 
                title={title}
                onPrevious={showNavigation ? () => console.log('Previous') : null}
                onNext={showNavigation ? () => console.log('Next') : null}
            />
            <div className="grid grid-cols-6 gap-4">
                {items.map((item) => (
                    <AlbumCard 
                        key={item.id} 
                        item={item}
                        onClick={() => onItemClick && onItemClick(item)}
                    />
                ))}
            </div>
        </div>
    );
}