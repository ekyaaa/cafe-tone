import SpotifyPlayer from '@/Components/SpotifyPlayer';

export default function AppLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Main content dengan padding bottom untuk music player */}
            <main className="flex-grow pb-[72px]">{children}</main>

            {/* Player tetap di bawah (fixed position) */}
            <SpotifyPlayer />
        </div>
    );
}