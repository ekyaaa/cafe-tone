<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (!$user || $user->id_role !== 1) {
            // If not admin, redirect or abort
            return redirect('/')->withErrors([
                'auth' => 'You do not have access as an admin.'
            ]);
        }

        return $next($request);
    }
}
