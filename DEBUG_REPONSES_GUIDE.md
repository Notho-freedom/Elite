# 🔍 Debug du système de réponses - Guide de test

## 🧪 **Tests à effectuer**

### **1. Vérifier que les réponses s'affichent**
1. **Répondre à un message texte**
   - Cliquer sur "Répondre" sur n'importe quel message
   - Taper une réponse et envoyer
   - **Attendu :** Preview du message original au-dessus de votre réponse

2. **Répondre à une image**
   - Cliquer sur "Répondre" sur un message avec image
   - Taper une réponse et envoyer
   - **Attendu :** Thumbnail de l'image + "📷 Photo"

### **2. Vérifier les logs de debug**
Ouvrir la console et chercher :
```
🔍 ReplyPreviewBubble - données reçues: {id: "...", text: "...", media: [...]}
```

### **3. Tester le scroll vers le message original**
1. **Cliquer sur la preview de réponse**
2. **Attendu :** 
   - Log: `🎯 Tentative de scroll vers le message: [messageId]`
   - Log: `✅ Message trouvé, scroll en cours...`
   - Scroll automatique vers le message original
   - Highlight bleu pendant 2 secondes

### **4. Si ça ne fonctionne pas**

#### **Problème 1: Pas de preview de réponse**
- **Cause probable :** `message.replyTo` est null/undefined
- **Solution :** Vérifier dans les logs si les données de réponse sont récupérées

#### **Problème 2: Preview sans données**
- **Logs attendus :** 
  ```
  🔍 ReplyPreviewBubble - données reçues: {
    id: "message-id",
    text: "contenu du message",
    senderName: "Nom expéditeur",
    media: [...] // si applicable
  }
  ```

#### **Problème 3: Scroll ne fonctionne pas**
- **Logs attendus :**
  ```
  🎯 Tentative de scroll vers le message: [messageId]
  ✅ Message trouvé, scroll en cours...
  ```
- **Si "Message non trouvé" :** L'attribut `data-message-id` manque

#### **Problème 4: Pas de highlight**
- **Vérifier :** L'animation CSS `highlight-message` dans `index.css`

## 🔧 **Dépannage rapide**

### **Vérifier les données dans la console :**
```javascript
// Dans la console du navigateur
document.querySelectorAll('[data-message-id]').forEach(el => {
  console.log('Message ID:', el.getAttribute('data-message-id'));
});
```

### **Forcer un test de scroll :**
```javascript
// Dans la console, remplacez "message-id" par un vrai ID
const messageId = "votre-message-id-ici";
const el = document.querySelector(`[data-message-id="${messageId}"]`);
if (el) {
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('highlight-message');
}
```

## 🎯 **Ce qui devrait fonctionner maintenant**

- ✅ **Function scrollToMessage** réparée (une seule version)
- ✅ **Logs de debug** ajoutés dans ReplyPreviewBubble
- ✅ **Attribut data-message-id** sur tous les messages
- ✅ **Animation highlight** en CSS
- ✅ **Données de réponse enrichies** dans supabase.js

**Testez maintenant et dites-moi ce que vous voyez dans les logs ! 🔍**
