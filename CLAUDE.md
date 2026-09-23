- **Fiche annonce** : le titre de l'annonce est dans la barre du haut, juste après la flèche de retour (h1 unique) ;
  le bloc d'en-tête garde le type de bien en badge. Le bouton « Envoyer un message » est toujours visible (avant :
  masqué sur sa propre annonce, ce qui ressemblait à un bug) ; sur sa propre annonce il est désactivé avec la mention
  `ownAnnounceHint`. **Boutique** : son « Envoyer un message » pointait vers `/messages?to=` (route inexistante → 404) ;
  remplacé par la même fenêtre d'envoi que la fiche annonce (`POST /messages`).
