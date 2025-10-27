// Script de test rapide pour vérifier la connexion au bucket
// À exécuter dans la console du navigateur (F12)

import { supabase } from './src/lib/supabase.js';

async function testBucketConnection() {
  console.log('🧪 TEST DE CONNEXION BUCKET');
  
  try {
    // 1. Vérifier que Supabase est connecté
    console.log('1️⃣ Test connexion Supabase...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Erreur authentification:', authError);
      return;
    }
    
    console.log('✅ Utilisateur connecté:', user?.id);
    
    // 2. Lister les buckets disponibles
    console.log('2️⃣ Liste des buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erreur listage buckets:', bucketsError);
      return;
    }
    
    console.log('📁 Buckets disponibles:', buckets);
    
    const chatMediaBucket = buckets.find(b => b.id === 'chat-media');
    if (!chatMediaBucket) {
      console.error('❌ Bucket chat-media introuvable !');
      console.log('💡 Exécutez le script create_bucket_simple.sql dans Supabase');
      return;
    }
    
    console.log('✅ Bucket chat-media trouvé:', chatMediaBucket);
    
    // 3. Test upload simple
    console.log('3️⃣ Test upload simple...');
    
    // Créer un fichier de test
    const testContent = 'Test Elite Chat - ' + new Date().toISOString();
    const testFile = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `${user.id}/test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(testFileName, testFile);
    
    if (uploadError) {
      console.error('❌ Erreur upload test:', uploadError);
      
      if (uploadError.message.includes('Bucket not found')) {
        console.log('💡 Le bucket n\'existe pas. Exécutez create_bucket_simple.sql');
      } else if (uploadError.message.includes('permission')) {
        console.log('💡 Problème de permissions. Vérifiez les politiques RLS');
      }
      
      return;
    }
    
    console.log('✅ Upload test réussi:', uploadData);
    
    // 4. Obtenir URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('chat-media')
      .getPublicUrl(testFileName);
    
    console.log('🌐 URL publique:', publicUrl);
    
    // 5. Nettoyer le fichier de test
    await supabase.storage.from('chat-media').remove([testFileName]);
    console.log('🧹 Fichier de test supprimé');
    
    console.log('🎉 TOUS LES TESTS RÉUSSIS !');
    console.log('✅ Le système de bucket fonctionne correctement');
    
  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
  }
}

// Exécuter le test
testBucketConnection();
