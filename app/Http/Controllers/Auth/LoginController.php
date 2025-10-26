<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    /**
     * Tampilkan form login
     */
    public function showLoginForm()
    {
        return Inertia::render('LoginPage', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    /**
     * Proses login dengan role-based redirect
     */
    public function login(Request $request)
    {
        // Validasi input
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Attempt login
        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $user = Auth::user();

            // Redirect berdasarkan role
            // id_role: 1 = admin, 2 = user, 3 = user_vip
            $redirectUrl = match ($user->id_role) {
                1 => route('admin.home'),        // Admin
                2, 3 => route('user.home'),      // Regular User & VIP User
                default => null,
            };

            if ($redirectUrl) {
                return Inertia::location($redirectUrl);
            }

            // Jika role tidak dikenali
            Auth::logout();
            return back()->withErrors([
                'email' => 'Role tidak dikenali.',
            ]);
        }

        return back()->withErrors([
            'email' => 'Email atau password salah.',
        ])->onlyInput('email');
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
