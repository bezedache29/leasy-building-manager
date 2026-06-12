<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, Property $property): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Property $property): bool
    {
        // Application mono-utilisateur : on autorise systématiquement la modification
        return true;
    }

    public function delete(User $user, Property $property): bool
    {
        return false;
    }

    public function restore(User $user, Property $property): bool
    {
        return false;
    }

    public function forceDelete(User $user, Property $property): bool
    {
        return false;
    }
}
