# Landing FlotteQ — Échange Lovable / DNS

Petit mémo pour brancher la landing Lovable existante sur `flotteq.fr`.

---

## 👉 Ce que tu (équipe métier / éditeur Lovable) dois me donner

Dans ton projet Lovable, va dans **Settings → Custom Domain** et ajoute `flotteq.fr` + `www.flotteq.fr`.

Lovable va t'afficher les enregistrements DNS à configurer. **Copie-moi exactement ce qu'il demande**, généralement de la forme :

```
flotteq.fr           A       76.76.21.21       (la vraie IP que Lovable donne)
www.flotteq.fr       CNAME   cname.lovable.app (ou un A record, selon ce qu'il demande)
```

Envoie-moi ces 2 lignes (IP exacte + valeur CNAME ou A) et je m'occupe du switch côté OVH.

---

## 👈 Ce que je te donne — URLs à mettre dans les boutons de ta landing

Juste **2 URLs** à coller — chacune ouvre une page « choisissez votre espace » avec 4 boutons (Client / Partenaire / Conducteur / Admin) :

| Bouton landing | URL à coller |
|---|---|
| **Se connecter** | `https://portal.flotteq.fr/login` |
| **Créer un compte** | `https://portal.flotteq.fr/register` |
| Contact email | `mailto:contact@flotteq.fr` |

C'est tout. La page portail s'occupe de rediriger chaque profil vers la bonne app (`app.`, `partner.`, `driver.`, `admin.` flotteq.fr). Si tu changes plus tard les sous-domaines internes, **ces 2 URLs restent valables** — tu n'as rien à modifier dans Lovable.

> Pas besoin de mettre un bouton « mot de passe oublié » dans la landing : chaque espace a son propre lien « mot de passe oublié » sur sa page de connexion.

---

## Ce qu'il se passe après

1. Tu m'envoies les DNS Lovable
2. Je change les records dans OVH (5 min) — j'ajoute aussi `portal.flotteq.fr → 37.59.96.178` côté serveur
3. Propagation DNS + génération SSL Lovable (5-30 min)
4. `https://flotteq.fr` affiche ta landing Lovable, avec cadenas vert
5. Les boutons (avec les 2 URLs ci-dessus) ouvrent le sélecteur d'espace hébergé sur le serveur

À partir de là, tu publies tes modifs Lovable comme d'habitude — c'est en ligne instantanément, je n'interviens plus.
