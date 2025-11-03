<div align="center">

# 🎵 Cafe Tone

**Smart Music Management System for Cafes & Restaurants**

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-1.x-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![Spotify API](https://img.shields.io/badge/Spotify-API-1DB954?style=for-the-badge&logo=spotify&logoColor=white)](https://developer.spotify.com)

*Revolutionizing cafe ambiance with intelligent music automation and customer interaction*

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 📖 About

**Cafe Tone** is an innovative music management system specifically designed for cafes and restaurants. It combines the power of Spotify Web Playback SDK with intelligent automation features, creating the perfect ambiance while respecting cultural and religious practices.

### 🎯 Why Cafe Tone?

- **🎼 Automated Ambiance**: Set different music genres for breakfast, lunch, and dinner times
- **🕌 Cultural Sensitivity**: Auto-pause during prayer times (Adhan detection)
- **📱 Customer Engagement**: QR-based music request system with tiered access
- **🎛️ Full Control**: Admin dashboard with real-time playback control
- **☁️ Cloud-Based**: No local music storage needed - powered by Spotify

---

## ✨ Features

### 🎵 Core Features

#### 1. **Multi-Tier User System**
- **Regular Customers**: Basic music request access via QR code
- **VIP Customers**: Priority requests + exclusive features
- **Admin**: Full control over playback and system settings

#### 2. **Smart Music Automation**
```
🌅 Morning (06:00-11:00)   → Jazz, Acoustic, Chill
🌤️ Afternoon (11:00-17:00) → Pop, Indie, Lounge  
🌆 Evening (17:00-22:00)   → Smooth Jazz, R&B
🌙 Night (22:00-06:00)     → Ambient, Classical
```

#### 3. **Prayer Time Integration** 🕌
- Automatic detection of Adhan (Islamic call to prayer)
- Auto-pause music during prayer times
- Configurable for multiple prayer schedules
- Respectful of religious practices

#### 4. **QR Code Music Request**
- Scan QR → Search Music → Submit Request
- Queue management system
- Request history tracking
- Anti-spam protection

#### 5. **Real-Time Playback Control**
- Play/Pause/Next/Previous
- Volume control
- Seek to position
- Device management
- Live now playing display

#### 6. **Smart Recommendations**
- Recently played tracks
- User's top tracks
- Personalized playlists
- Featured playlists by country

---

## 🛠️ Tech Stack

### Backend
- **Laravel 11.x** - Modern PHP framework
- **MySQL** - Relational database
- **Spotify Web API** - Music streaming service
- **Guzzle HTTP** - API client

### Frontend
- **React 18.x** - UI library
- **Inertia.js** - SPA framework
- **Tailwind CSS** - Utility-first CSS
- **Spotify Web Playback SDK** - In-browser playback

### DevOps
- **Vite** - Fast build tool
- **Composer** - PHP dependency manager
- **NPM** - JavaScript package manager

---

## 🚀 Installation

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+
- Spotify Premium Account
- Spotify Developer Application

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/cafe-tone.git
cd cafe-tone
```

### Step 2: Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### Step 3: Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 4: Configure Spotify API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Add redirect URI: `http://localhost:8000/spotify/callback`
4. Copy Client ID and Client Secret to `.env`:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8000/spotify/callback
```

### Step 5: Database Setup
```bash
# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cafe_tone
DB_USERNAME=root
DB_PASSWORD=

# Run migrations
php artisan migrate
```

### Step 6: Build & Run
```bash
# Build frontend assets
npm run build

# Start development server
php artisan serve

# For development with hot reload
npm run dev
```

Visit: `http://localhost:8000`

---

## 📱 Usage

### For Admins

1. **Connect Spotify Account**
   - Click "Connect Spotify" on login page
   - Authorize the application
   - Your account is now linked

2. **Control Playback**
   - Use player controls in dashboard
   - Browse and play from your playlists
   - Monitor currently playing track

3. **Manage Time-Based Genres**
   - Set genre preferences for different time slots
   - System automatically switches genres

4. **Configure Prayer Times**
   - Set local prayer schedule
   - Enable/disable auto-pause feature

### For Customers

1. **Scan QR Code**
   - Find QR code displayed in cafe
   - Scan with any QR reader

2. **Search & Request**
   - Search for your favorite song
   - Submit request
   - Wait for admin approval (VIP gets priority)

3. **Track Your Request**
   - View request status
   - See queue position

---

## 🏗️ Project Structure

```
cafe-tone/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── AdminHomeController.php
│   │   │   │   ├── AdminPlaylistController.php
│   │   │   │   └── AdminSearchController.php
│   │   │   └── SpotifyController.php
│   │   └── Middleware/
│   ├── Models/
│   │   ├── SpotifyTokenModel.php
│   │   └── User.php
│   └── Services/
│       └── SpotifyService.php          # Core Spotify API integration
├── resources/
│   └── js/
│       ├── Components/
│       │   ├── SpotifyPlayer.jsx       # Web Playback SDK wrapper
│       │   ├── MusicCard.jsx
│       │   └── Navbar.jsx
│       ├── Pages/
│       │   ├── HomeAdmin.jsx
│       │   ├── PlaylistDetail.jsx
│       │   └── Search.jsx
│       └── Hooks/
│           └── useSpotifyConnection.js
├── routes/
│   └── web.php                         # Application routes
└── database/
    └── migrations/                     # Database schema
```

---

## 🔌 API Integration

### Spotify API Scopes
```php
'streaming',                    // Web Playback SDK
'user-read-playback-state',    // Read playback state
'user-modify-playback-state',  // Control playback
'user-read-currently-playing', // Get current track
'playlist-read-private',       // Read private playlists
'user-top-read',               // Get top tracks
'user-read-recently-played',   // Get history
```

### Key Endpoints Used
- `/me/player` - Playback control
- `/me/playlists` - User playlists
- `/me/top/tracks` - Top tracks
- `/me/player/recently-played` - History
- `/browse/featured-playlists` - Discover
- `/search` - Search tracks

---

## 🎨 Screenshots

<div align="center">

### Admin Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Music Search
![Search](https://via.placeholder.com/800x400?text=Search+Screenshot)

### Playback Control
![Player](https://via.placeholder.com/800x400?text=Player+Screenshot)

</div>

---

## 🔧 Configuration

### Prayer Time Schedule
Edit `config/prayer-times.php`:
```php
return [
    'fajr' => '04:30',
    'dhuhr' => '12:00',
    'asr' => '15:15',
    'maghrib' => '18:00',
    'isha' => '19:15',
];
```

### Genre Time Slots
Edit `config/music-schedule.php`:
```php
return [
    'morning' => ['jazz', 'acoustic', 'chill'],
    'afternoon' => ['pop', 'indie', 'lounge'],
    'evening' => ['smooth-jazz', 'rnb'],
    'night' => ['ambient', 'classical'],
];
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Inertia.js](https://inertiajs.com)
- [Tailwind CSS](https://tailwindcss.com)

---

<div align="center">

**Made with ❤️ for cafes everywhere**

⭐ Star this repo if you find it useful!

</div>