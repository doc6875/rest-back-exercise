User Stories pour le Service de Gestion des Produits
Récupérer tous les produits (GET /products)
En tant qu'utilisateur,
Je veux voir une liste de tous les produits,
Afin de pouvoir consulter le catalogue complet.
Critères d'acceptation :

Le système récupère une liste de tous les produits depuis la base de données.
La réponse inclut les détails essentiels des produits (ID, nom, description, prix).
S'il n'y a pas de produits, le système renvoie une liste vide.

Récupérer un produit par ID (GET /products/:id)
En tant qu'utilisateur,
Je veux consulter les détails d'un produit spécifique,
Afin de pouvoir obtenir des informations complètes sur ce produit.
Critères d'acceptation :

Le système récupère les détails d'un produit sur la base de l'ID fourni.
La réponse inclut tous les détails du produit (nom, description, prix, stock).
Si l'ID du produit n'existe pas, le système renvoie une erreur 404 avec un message explicatif.

Créer un produit (POST /products)
En tant qu'administrateur,
Je veux créer un nouveau produit,
Afin de pouvoir l'ajouter au catalogue.
Critères d'acceptation :

Une requête valide contient les informations du produit (nom, description, prix, stock).
Le système crée un nouveau produit et le stocke dans la base de données.
Si les données saisies sont invalides, le système renvoie une erreur 400 avec un retour sur la validation.
Après la création, le système répond avec les détails du nouveau produit créé.

Mettre à jour un produit (PUT /products/:id)
En tant qu'administrateur,
Je veux mettre à jour les informations d'un produit,
Afin de pouvoir modifier ses caractéristiques si nécessaire.
Critères d'acceptation :

Le système met à jour le produit sur la base de l'ID fourni et du corps de la requête.
Une requête valide contient uniquement les champs à mettre à jour.
Si l'ID du produit n'existe pas, le système renvoie une erreur 404.
Si les données saisies sont invalides, le système renvoie une erreur 400 avec un retour sur la validation.
Les détails mis à jour du produit sont reflétés dans la base de données.

Supprimer un produit (DELETE /products/:id)
En tant qu'administrateur,
Je veux supprimer un produit du catalogue,
Afin de retirer les produits qui ne sont plus disponibles.
Critères d'acceptation :

Le système supprime le produit associé à l'ID fourni.
Si l'ID du produit n'existe pas, le système renvoie une erreur 404.
Si la suppression est réussie, le système répond avec un message de confirmation.
Le produit supprimé n'est plus récupérable dans la base de données.
