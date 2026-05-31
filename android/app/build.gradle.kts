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
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
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
}

dependencies {
  implementation(libs.androidx.core.ktx)
}
