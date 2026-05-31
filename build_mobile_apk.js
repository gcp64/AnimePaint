import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ART_DIR = 'd:\\المشاريع\\art';
const ANDROID_DIR = 'd:\\المشاريع\\AnimePaint_Android';
const DESKTOP_DIR = 'C:\\Users\\Mr .bob\\Desktop';

function findJavaHome() {
    // Search common paths for Microsoft OpenJDK or standard JDK 17
    const searchDirs = [
        'C:\\Program Files\\Microsoft',
        'C:\\Program Files\\Java',
        'C:\\Program Files (x86)\\Java'
    ];

    for (const baseDir of searchDirs) {
        if (fs.existsSync(baseDir)) {
            const files = fs.readdirSync(baseDir);
            for (const file of files) {
                if (file.toLowerCase().includes('jdk-17') || file.toLowerCase().includes('jdk17') || file.toLowerCase().startsWith('jdk-')) {
                    const fullPath = path.join(baseDir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        console.log(`Discovered JDK at: ${fullPath}`);
                        return fullPath;
                    }
                }
            }
        }
    }
    return null;
}

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    const elements = fs.readdirSync(from);
    for (const element of elements) {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.statSync(fromPath).isDirectory()) {
            copyFolderSync(fromPath, toPath);
        } else {
            fs.copyFileSync(fromPath, toPath);
        }
    }
}

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
    }
}

async function build() {
    try {
        console.log('Step 1: Building web assets with Parcel...');
        execSync('npm run build', { cwd: ART_DIR, stdio: 'inherit' });

        console.log('Step 2: Preparing assets directory in Android project...');
        const assetsDistDir = path.join(ANDROID_DIR, 'app', 'src', 'main', 'assets', 'dist');
        if (fs.existsSync(assetsDistDir)) {
            console.log('Clearing old assets...');
            deleteFolderRecursive(assetsDistDir);
        }
        fs.mkdirSync(assetsDistDir, { recursive: true });

        console.log('Step 3: Copying web assets to Android assets folder...');
        copyFolderSync(path.join(ART_DIR, 'dist'), assetsDistDir);

        console.log('Step 4: Looking for JDK 17 installation...');
        const jdkPath = findJavaHome();
        if (jdkPath) {
            process.env.JAVA_HOME = jdkPath;
            console.log(`Setting JAVA_HOME dynamically to: ${jdkPath}`);
        } else {
            console.warn('Warning: JDK 17 path could not be found automatically. Build might fail if JAVA_HOME is not configured.');
        }

        console.log('Step 5: Compiling APK using Gradle...');
        execSync('.\\gradlew.bat assembleDebug', { cwd: ANDROID_DIR, stdio: 'inherit' });

        console.log('Step 6: Copying output APK to Desktop...');
        const outputApkSrc = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
        const outputApkDest = path.join(DESKTOP_DIR, 'AnimePaint_Mobile.apk');

        if (fs.existsSync(outputApkSrc)) {
            fs.copyFileSync(outputApkSrc, outputApkDest);
            console.log(`Success! APK copied to Desktop: ${outputApkDest}`);
        } else {
            throw new Error(`Compiled APK was not found at expected location: ${outputApkSrc}`);
        }
    } catch (error) {
        console.error('Build execution failed:', error.message);
        process.exit(1);
    }
}

build();
