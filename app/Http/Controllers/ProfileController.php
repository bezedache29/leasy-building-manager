<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'hasSignature' => Storage::disk('local')->exists('signature.png'),
        ]);
    }

    public function storeSignature(Request $request): RedirectResponse
    {
        $request->validate([
            'signature' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $manager = new ImageManager(new Driver());
        $image   = $manager->read($request->file('signature')->getRealPath());
        $image->scaleDown(width: 400);
        $encoded = $image->toPng();

        Storage::disk('local')->put('signature.png', $encoded->toString());

        return Redirect::route('profile.edit')->with('status', 'signature-updated');
    }

    public function destroySignature(Request $request): RedirectResponse
    {
        Storage::disk('local')->delete('signature.png');

        return Redirect::route('profile.edit')->with('status', 'signature-deleted');
    }

    public function showSignature(): mixed
    {
        if (!Storage::disk('local')->exists('signature.png')) {
            abort(404);
        }

        return response(Storage::disk('local')->get('signature.png'))
            ->header('Content-Type', 'image/png');
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
