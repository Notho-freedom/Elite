package com.parallele.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Gérer l'intent initial pour l'authentification
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        
        // Gérer les nouveaux intents (retour depuis le navigateur)
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent != null && intent.getData() != null) {
            Uri data = intent.getData();
            Log.d(TAG, "Intent reçu avec data: " + data.toString());
            
            // Vérifier si c'est un lien d'authentification Firebase
            if (data.getHost() != null && data.getHost().contains("firebaseapp.com")) {
                Log.d(TAG, "Lien d'authentification Firebase détecté");
                
                // Envoyer l'URL au WebView via Capacitor
                String url = data.toString();
                bridge.eval("window.handleAuthRedirect && window.handleAuthRedirect('" + url + "')", null);
            }
        }
    }
}
