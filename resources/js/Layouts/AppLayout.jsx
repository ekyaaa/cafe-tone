import SpotifyPlayer from '@/Components/SpotifyPlayer';
import Sidebar from '@/Components/Sidebar';

export default function AppLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen overflow-x-auto">
            <Sidebar></Sidebar>
            {/* Main content dengan padding bottom untuk music player */}
            <main className="flex-grow pb-[72px] pl-60">{children}</main>

            {/* Player tetap di bawah (fixed position) */}
            <SpotifyPlayer />
        </div>
    );
}