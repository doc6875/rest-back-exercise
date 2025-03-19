User Stories pour le Service de Gestion des Factures
Récupérer toutes les factures (GET /invoices)
En tant qu'utilisateur,
Je veux voir une liste de toutes les factures,
Afin de pouvoir consulter l'historique des transactions.
Critères d'acceptation :

Le système récupère une liste de toutes les factures depuis la base de données.
La réponse inclut les détails essentiels des factures (ID, date, montant total, statut).
S'il n'y a pas de factures, le système renvoie une liste vide.

Récupérer une facture par ID (GET /invoices/:id)
En tant qu'utilisateur,
Je veux consulter les détails d'une facture spécifique,
Afin de pouvoir obtenir des informations complètes sur cette transaction.
Critères d'acceptation :

Le système récupère les détails d'une facture sur la base de l'ID fourni.
La réponse inclut tous les détails de la facture (date, client, produits, montant).
Si l'ID de la facture n'existe pas, le système renvoie une erreur 404 avec un message explicatif.

Créer une facture (POST /invoices)
En tant qu'administrateur,
Je veux créer une nouvelle facture,
Afin d'enregistrer une nouvelle transaction.
Critères d'acceptation :

Une requête valide contient les informations de la facture (client, produits, montant).
Le système crée une nouvelle facture et la stocke dans la base de données.
Si les données saisies sont invalides, le système renvoie une erreur 400 avec un retour sur la validation.
Après la création, le système répond avec les détails de la nouvelle facture créée.

Mettre à jour une facture (PUT /invoices/:id)
En tant qu'administrateur,
Je veux mettre à jour les informations d'une facture,
Afin de pouvoir modifier ses détails si nécessaire.
Critères d'acceptation :

Le système met à jour la facture sur la base de l'ID fourni et du corps de la requête.
Une requête valide contient uniquement les champs à mettre à jour.
Si l'ID de la facture n'existe pas, le système renvoie une erreur 404.
Si les données saisies sont invalides, le système renvoie une erreur 400 avec un retour sur la validation.
Les détails mis à jour de la facture sont reflétés dans la base de données.

Supprimer une facture (DELETE /invoices/:id)
En tant qu'administrateur,
Je veux supprimer une facture du système,
Afin de retirer les factures erronées ou annulées.
Critères d'acceptation :

Le système supprime la facture associée à l'ID fourni.
Si l'ID de la facture n'existe pas, le système renvoie une erreur 404.
Si la suppression est réussie, le système répond avec un message de confirmation.
La facture supprimée n'est plus récupérable dans la base de données.