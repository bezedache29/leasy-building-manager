<?php

namespace App\Http\Controllers;

use App\Models\Document;

class DocumentController extends Controller
{
    /**
     * Remove the specified document from storage (Soft Delete).
     */
    public function destroy(Document $document)
    {
        // Grâce au Soft Delete configuré sur le modèle Document,
        // la ligne en base est marquée comme supprimée mais le fichier physique est conservé.
        $document->delete();

        // On renvoie l'utilisateur sur la page où il était
        return back()->with('success', 'Le document a été retiré du dossier.');
    }
}
