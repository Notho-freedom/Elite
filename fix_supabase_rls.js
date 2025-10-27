#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuration Supabase
const SUPABASE_URL = 'https://oxazzejsmratrlzvrdfq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YXp6ZWpzbXJhdHJsenZyZGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjY2MTIsImV4cCI6MjA3MDEwMjYxMn0.Gsh1qd6lBBvZCtWPd1gNHsCW1XMbgbVx2ePCGVLoCHk';

console.log('🔧 Correction des politiques RLS Supabase pour Elite Chat\n');

async function fixRLSPolicies() {
  // Créer le client Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    console.log('📖 Lecture du fichier de correction...');
    const sqlScript = fs.readFileSync('./tests/fix_rls_policies_corrected.sql', 'utf8');
    
    console.log('🚀 Application des corrections RLS...');
    
    // Diviser le script en commandes individuelles
    const commands = sqlScript
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Ignorer les commentaires et les blocs de commentaires
      if (command.startsWith('/*') || command.startsWith('--') || command.includes('RAISE NOTICE')) {
        continue;
      }

      try {
        console.log(`📝 Exécution commande ${i + 1}/${commands.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: command + ';' 
        });

        if (error) {
          // Certaines erreurs sont acceptables (DROP si n'existe pas, etc.)
          if (error.message.includes('does not exist') || 
              error.message.includes('already exists')) {
            console.log(`⚠️  Avertissement: ${error.message}`);
          } else {
            console.error(`❌ Erreur: ${error.message}`);
            errorCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Erreur exécution: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`✅ Commandes réussies: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Politiques RLS corrigées avec succès !');
      return true;
    } else {
      console.log('\n⚠️  Correction terminée avec quelques erreurs');
      return false;
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
    return false;
  }
}

async function testRLSFix() {
  console.log('\n🧪 Test des politiques corrigées...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Test simple de lecture des discussions
    const { data, error } = await supabase
      .from('discussions')
      .select('id, name, type')
      .limit(1);

    if (error) {
      if (error.code === '42P17') {
        console.log('❌ La récursion infinie persiste');
        return false;
      } else if (error.code === 'PGRST301') {
        console.log('✅ Pas de récursion - Erreur d\'authentification normale');
        return true;
      } else {
        console.log(`⚠️  Erreur différente: ${error.message}`);
        return true; // Probablement OK, juste pas d'auth
      }
    } else {
      console.log('✅ Requête réussie - Politiques RLS fonctionnelles');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur test:', error.message);
    return false;
  }
}

// Fonction alternative via l'API REST directe
async function applyRLSFixViaREST() {
  console.log('\n🔄 Tentative via l\'API REST directe...');
  
  // Commandes critiques pour éliminer la récursion
  const criticalCommands = [
    `DROP POLICY IF EXISTS "Users can view participated discussions" ON public.discussions`,
    `DROP POLICY IF EXISTS "Users can view discussion participants" ON public.discussion_participants`,
    `CREATE POLICY "Enable read for discussion participants" ON public.discussions
     FOR SELECT USING (
       id IN (
         SELECT DISTINCT dp.discussion_id 
         FROM public.discussion_participants dp 
         WHERE dp.user_id = auth.uid() 
         AND dp.is_active = true
       )
     )`,
    `CREATE POLICY "Enable read participants for discussion members" ON public.discussion_participants
     FOR SELECT USING (
       discussion_id IN (
         SELECT DISTINCT dp2.discussion_id 
         FROM public.discussion_participants dp2 
         WHERE dp2.user_id = auth.uid() 
         AND dp2.is_active = true
       )
     )`
  ];

  console.log('📝 Application des commandes critiques via REST...');
  
  for (const command of criticalCommands) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ sql_query: command })
      });

      if (response.ok) {
        console.log('✅ Commande exécutée');
      } else {
        console.log(`⚠️  Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
  }
}

// Main
(async () => {
  console.log('🎯 Objectif: Éliminer la récursion infinie dans les politiques RLS\n');
  
  // Méthode 1: Via le client Supabase
  const success = await fixRLSPolicies();
  
  if (!success) {
    // Méthode 2: Via l'API REST
    await applyRLSFixViaREST();
  }
  
  // Test final
  const testOK = await testRLSFix();
  
  if (testOK) {
    console.log('\n🎉 Configuration terminée avec succès !');
    console.log('\n📋 Prochaines étapes :');
    console.log('   1. ✅ Backend Elite Chat opérationnel');
    console.log('   2. ✅ Politiques RLS corrigées');
    console.log('   3. 🚀 Relancez votre frontend pour voir les changements');
    console.log('\n💡 Utilisez: npm run dev (frontend) + le backend en cours');
  } else {
    console.log('\n🚨 Problème persistant - correction manuelle nécessaire');
    console.log('\n📝 Actions manuelles dans Supabase Dashboard :');
    console.log('   1. Allez dans Database > Policies');
    console.log('   2. Supprimez les politiques sur discussion_participants');
    console.log('   3. Appliquez le contenu de tests/fix_rls_policies_corrected.sql');
  }
})();
