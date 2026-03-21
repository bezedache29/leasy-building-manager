<?php

namespace App\Policies;

use App\Models\Lease;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class LeasePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Lease $lease): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Lease $lease): bool
    {
        // On suppose que le bien appartient à un utilisateur
        return $user->id === $lease->property->user_id;

        // Ou si c'est une application à usage unique strictement personnelle :
        // return true; // (À éviter si tu comptes l'ouvrir à d'autres un jour)
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Lease $lease): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Lease $lease): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Lease $lease): bool
    {
        return false;
    }
}
