plugins {
  alias(libs.plugins.android.application)
}

android {
    namespace = "com.example.animepaint"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.animepaint"
        minSdk = 24
        targetSdk = 36
        versionCode = 7
        versionName = "1.7.0"
    }

    signingConfigs {
        create("release") {
            storeFile = file("animepaint.jks")
            storePassword = "animepaint123"
            keyAlias = "animepaint"
            keyPassword = "animepaint123"

            // Enable V1 (JAR), V2 (Full APK), V3 (Key Rotation), V4 (Incremental) signing
            enableV1Signing = true
            enableV2Signing = true
            enableV3Signing = true
            enableV4Signing = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = false
        aidl = false
        buildConfig = false
        shaders = false
    }

    // Security: Enable resource shrinking aggressively
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
            excludes += "/META-INF/DEPENDENCIES"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
