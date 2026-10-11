const fs = require('fs');
const path = require('path');

// Write complete Android native project to ./android/
const files = {
  'android/build.gradle.kts': `// Top-level build file
plugins {
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
    id("org.jetbrains.kotlin.kapt") version "1.9.22" apply false
}
`,
  'android/settings.gradle.kts': `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Gestion Clients & Facturation"
include(":app")
`,
  'android/gradle.properties': `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`,
  'android/app/build.gradle.kts': `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
}

android {
    namespace = "com.facturation.client"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.facturation.client"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")

    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    kapt("androidx.room:room-compiler:$roomVersion")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
`,
  'android/app/src/main/AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.facturation.client">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Gestion Clients &amp; Facturation"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Facturation">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.Facturation">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  'android/app/src/main/res/values/strings.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Gestion Clients &amp; Facturation</string>
</resources>
`,
  'android/app/src/main/res/values/styles.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.Facturation" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">#2563EB</item>
    </style>
</resources>
`,
  'android/app/src/main/java/com/facturation/client/MainActivity.kt': `package com.facturation.client

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.facturation.client.data.local.AppDatabase
import com.facturation.client.ui.MainApp
import com.facturation.client.ui.MainViewModel
import com.facturation.client.ui.MainViewModelFactory
import com.facturation.client.ui.theme.FacturationTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val database = AppDatabase.getDatabase(applicationContext)
        val viewModelFactory = MainViewModelFactory(database.clientDao(), database.invoiceDao())

        setContent {
            FacturationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val viewModel: MainViewModel = viewModel(factory = viewModelFactory)
                    MainApp(viewModel = viewModel)
                }
            }
        }
    }
}
`,
  'android/README.md': `# Gestion Clients & Facturation (Projet Android Natif Kotlin Jetpack Compose)

Projet Android complet, 100% hors-ligne, sans Firebase, avec base SQLite Room et interface Jetpack Compose.
Pour exécuter :
1. Ouvrez ce répertoire dans Android Studio.
2. Synchronisez Gradle.
3. Branchez votre téléphone Android ou lancez un émulateur.
4. Cliquez sur Run ▶.
`
};

for (const [filePath, content] of Object.entries(files)) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

console.log("Tous les fichiers Android physiques ont été écrits avec succès dans ./android/");
