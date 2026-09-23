# Assistant Phoxia

L'assistant apparaît en bas à droite de toutes les pages du site Phoxia.

## Deux modes

| Mode | Réglage | Réponses |
|---|---|---|
| **Intégré** (par défaut) | `ENDPOINT = ''` dans `assets/js/chatbot.js` | Base de réponses écrite dans le script : offres, méthode, tarifs, rendez-vous, contact, équipe, RGPD, stages. Gratuit, aucun serveur. |
| **Agent IA** | `ENDPOINT = 'https://…workers.dev'` | Claude répond librement à partir des consignes de `worker.js`. En cas de panne, repli automatique sur la base intégrée. |

## Passer en mode agent IA (environ 10 minutes)

1. **Clé API** : créer une clé sur [console.anthropic.com](https://console.anthropic.com), puis définir une limite de dépense mensuelle dans *Settings > Limits*.
2. **Worker** : sur [dash.cloudflare.com](https://dash.cloudflare.com), *Workers & Pages > Create > Worker*. Nommer le Worker `phoxia-chat`, cliquer *Edit code*, coller tout le contenu de `chatbot/worker.js`, puis *Deploy*.
3. **Secret** : dans le Worker, *Settings > Variables and Secrets > Add*, type *Secret*, nom `ANTHROPIC_API_KEY`, valeur = la clé. La clé ne quitte jamais Cloudflare et n'apparaît pas dans le site.
4. **Protection** (recommandé) : *Security > WAF > Rate limiting rules*, par exemple 20 requêtes par minute et par IP sur l'URL du Worker.
5. **Brancher le site** : copier l'URL du Worker (`https://phoxia-chat.<compte>.workers.dev`) dans `ENDPOINT`, en haut de `assets/js/chatbot.js`, puis publier.

Le Worker n'accepte que les requêtes venant de `phoxia.fr` et `www.phoxia.fr` (liste `ORIGINES_AUTORISEES`).

## Modifier ce que dit l'assistant

- **Mode intégré** : tableau `intentions` dans `assets/js/chatbot.js` (mots-clés + réponse).
- **Mode agent IA** : texte `CONSIGNES` dans `chatbot/worker.js`, puis redéployer le Worker.

## Confidentialité

En mode agent IA, les messages des visiteurs sont transmis à Anthropic pour générer la réponse. Penser à ajouter une ligne à ce sujet dans `politique-de-confidentialite.html` au moment de l'activation.
