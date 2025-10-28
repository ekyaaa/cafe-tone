import SectionHeader from './SectionHeader';
import MusicCard from './MusicCard';

export default function MusicSection({ title, items, showNavigation = false, onItemClick }) {
    return (
        <div className="mb-12">
            <SectionHeader 
                title={title}
                onPrevious={showNavigation ? () => console.log('Previous') : null}
                onNext={showNavigation ? () => console.log('Next') : null}
            />
            <div className="grid grid-cols-4 gap-4">
                {items.map((item) => (
                    <MusicCard 
                        key={item.id} 
                        item={item} 
                        showPlayButton={true}
                        onClick={() => onItemClick && onItemClick(item)}
                    />
                ))}
            </div>
        </div>
    );
}