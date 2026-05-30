import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE = __dirname;
process.chdir(WORKSPACE);

console.log('--- STARTING BUILD AND PACKAGING PIPELINE ---');

// 0. Build custom ICO icon file from original JPG
console.log('Generating custom application icon...');
execSync('python make_ico.py', { stdio: 'inherit' });

// 1. Set environment variables for electron cache
process.env.ELECTRON_CACHE = path.join(WORKSPACE, '.electron-cache');
console.log(`Setting ELECTRON_CACHE to: ${process.env.ELECTRON_CACHE}`);

// Ensure directories exist
if (!fs.existsSync(process.env.ELECTRON_CACHE)) {
    fs.mkdirSync(process.env.ELECTRON_CACHE, { recursive: true });
}

const distAppDir = path.join(WORKSPACE, 'dist-app');
if (fs.existsSync(distAppDir)) {
    console.log('Cleaning existing dist-app directory...');
    fs.rmSync(distAppDir, { recursive: true, force: true });
}
fs.mkdirSync(distAppDir, { recursive: true });

const distDir = path.join(WORKSPACE, 'dist');
if (fs.existsSync(distDir)) {
    console.log('Cleaning existing dist directory...');
    fs.rmSync(distDir, { recursive: true, force: true });
}

// 2. Build languages
console.log('Building language bundles...');
execSync('npm run lang:build', { stdio: 'inherit' });

// 3. Build frontend bundle
console.log('Building frontend production bundle via Parcel...');
execSync('npm run build', { stdio: 'inherit' });

// Prune source maps (*.map) in dist folder before packaging to save space inside ASAR
console.log('Pruning source maps (*.map) in dist directory...');
if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    let deletedCount = 0;
    files.forEach(file => {
        if (file.endsWith('.map')) {
            fs.unlinkSync(path.join(distDir, file));
            deletedCount++;
        }
    });
    console.log(`Deleted ${deletedCount} source map files from dist.`);
}

// 4. Run electron-packager with ASAR enabled to optimize file sizes and structure
console.log('Packaging application with electron-packager (ASAR enabled)...');
const ignorePattern = '/(\\.git|\\.github|\\.npm-cache|\\.electron-cache|\\.parcel-cache|node_modules|dist-app|src|examples|build_pack\\.js|task\\.md|implementation_plan\\.md|walkthrough\\.md|Dockerfile|docker-compose\\.yml|\\.dockerignore|\\.gitattributes|\\.gitignore|\\.npmrc|make_ico\\.py|app\\.ico|app_logo\\.jpg|upx\\.exe)($|/)';
const packagerCmd = `npx electron-packager . AnimePaint --platform=win32 --arch=x64 --out=dist-app --overwrite --icon=app.ico --ignore="${ignorePattern}" --asar`;
console.log(`Running: ${packagerCmd}`);
execSync(packagerCmd, { stdio: 'inherit' });

// Locate packaged folder
const packagedFolders = fs.readdirSync(distAppDir).filter(f => f.startsWith('AnimePaint-win32-x64'));
if (packagedFolders.length === 0) {
    throw new Error('Failed to find packaged electron folder in dist-app!');
}
const appFolder = path.join(distAppDir, packagedFolders[0]);
console.log(`Packaged app folder found at: ${appFolder}`);

// 5. Prune unused Chromium locales (Keep only en-US.pak to save space)
const localesDir = path.join(appFolder, 'locales');
if (fs.existsSync(localesDir)) {
    console.log('Pruning Chromium locales to reduce size...');
    const files = fs.readdirSync(localesDir);
    let deletedCount = 0;
    files.forEach(file => {
        if (file !== 'en-US.pak') {
            fs.unlinkSync(path.join(localesDir, file));
            deletedCount++;
        }
    });
    console.log(`Deleted ${deletedCount} unused locale files.`);
}

// Prune unneeded binaries outside ASAR to save space
console.log('Pruning unneeded binaries and license files to reduce size...');
const filesToPrune = [
    path.join(appFolder, 'LICENSES.chromium.html'),
    path.join(appFolder, 'vk_swiftshader.dll'),
    path.join(appFolder, 'vk_swiftshader_icd.json'),
    path.join(appFolder, 'vulkan-1.dll')
];
let prunedFilesCount = 0;
filesToPrune.forEach(file => {
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        prunedFilesCount++;
    }
});
console.log(`Pruned ${prunedFilesCount} unneeded files.`);

// 5.5 Write build version file directly in appFolder to ensure version checks work
const buildVersion = Date.now().toString();
const versionFilePath = path.join(appFolder, 'version.txt');
fs.writeFileSync(versionFilePath, buildVersion);
console.log(`Version file written with code: ${buildVersion}`);

// 6. Compress and package using 7-Zip LZMA2 Solid or ZIP Deflate fallback
const exe7z = 'C:\\Program Files\\7-Zip\\7z.exe';
const upxExe = path.join(WORKSPACE, 'upx.exe');
const desktopDir = path.join(process.env.USERPROFILE || 'C:\\Users\\default', 'Desktop');
const finalExePath = path.join(desktopDir, 'AnimePaint_Maria_Core_Final.exe');
const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
const programCsPath = path.join(distAppDir, 'Program.cs');

if (fs.existsSync(exe7z)) {
    console.log('--- USING 7-ZIP LZMA2 SOLID ULTRA COMPRESSION ---');
    
    // Copy 7z.exe to dist-app to package it
    const local7zExe = path.join(distAppDir, '7z.exe');
    fs.copyFileSync(exe7z, local7zExe);
    
    // Compress 7z.exe with UPX if available to save 350KB
    if (fs.existsSync(upxExe)) {
        console.log('Compressing 7z.exe helper with UPX...');
        execSync(`"${upxExe}" --best "${local7zExe}"`, { stdio: 'inherit' });
    }
    
    // Create Solid .7z archive with maximum LZMA2 compression
    const archive7zPath = path.join(distAppDir, 'app.7z');
    if (fs.existsSync(archive7zPath)) fs.unlinkSync(archive7zPath);
    const compressCmd = `"${exe7z}" a -t7z -mx=9 -m0=lzma2 -ms=on "${archive7zPath}" "${appFolder}\\*"`;
    console.log(`Running: ${compressCmd}`);
    execSync(compressCmd, { stdio: 'inherit' });
    console.log('LZMA2 Solid archive created successfully.');
    
    // Create 7z-based Program.cs launcher code
    const csharpCode7z = `
using System;
using System.IO;
using System.Diagnostics;
using System.Reflection;
using System.Linq;

namespace AnimePaintLauncher
{
    static class Program
    {
        private const string BuildVersion = "${buildVersion}";

        [STAThread]
        static void Main()
        {
            try
            {
                string tempRoot = Path.Combine(Path.GetTempPath(), "AnimePaint_Maria_Core_Final");
                string appDir = Path.Combine(tempRoot, "app");
                string exePath = Path.Combine(appDir, "AnimePaint.exe");
                string versionFile = Path.Combine(appDir, "version.txt");
                
                bool needsExtraction = true;
                if (Directory.Exists(appDir) && File.Exists(exePath) && File.Exists(versionFile))
                {
                    try
                    {
                        string extractedVersion = File.ReadAllText(versionFile).Trim();
                        if (extractedVersion == BuildVersion)
                        {
                            needsExtraction = false;
                        }
                    }
                    catch {}
                }
                
                if (needsExtraction)
                {
                    if (Directory.Exists(tempRoot))
                    {
                        try { Directory.Delete(tempRoot, true); } catch {}
                    }
                    Directory.CreateDirectory(tempRoot);
                    
                    Assembly assembly = Assembly.GetExecutingAssembly();
                    
                    // Extract 7z.exe
                    string exeResourceName = assembly.GetManifestResourceNames().FirstOrDefault(r => r.EndsWith("7z.exe"));
                    if (exeResourceName == null) throw new Exception("Resource 7z.exe not found.");
                    string exeToolPath = Path.Combine(tempRoot, "7z.exe");
                    using (Stream stream = assembly.GetManifestResourceStream(exeResourceName))
                    using (FileStream fileStream = new FileStream(exeToolPath, FileMode.Create, FileAccess.Write))
                    {
                        stream.CopyTo(fileStream);
                    }
                    
                    // Extract app.7z
                    string archiveResourceName = assembly.GetManifestResourceNames().FirstOrDefault(r => r.EndsWith("app.7z"));
                    if (archiveResourceName == null) throw new Exception("Resource app.7z not found.");
                    string archivePath = Path.Combine(tempRoot, "app.7z");
                    using (Stream stream = assembly.GetManifestResourceStream(archiveResourceName))
                    using (FileStream fileStream = new FileStream(archivePath, FileMode.Create, FileAccess.Write))
                    {
                        stream.CopyTo(fileStream);
                    }
                    
                    // Run 7z.exe extraction
                    ProcessStartInfo extractPsi = new ProcessStartInfo();
                    extractPsi.FileName = exeToolPath;
                    extractPsi.Arguments = string.Format("x \\"{0}\\" -o\\"{1}\\" -y", archivePath, appDir);
                    extractPsi.CreateNoWindow = true;
                    extractPsi.UseShellExecute = false;
                    extractPsi.WindowStyle = ProcessWindowStyle.Hidden;
                    
                    using (Process p = Process.Start(extractPsi))
                    {
                        p.WaitForExit();
                        if (p.ExitCode != 0) throw new Exception("7z extraction failed: " + p.ExitCode);
                    }
                    
                    try { File.Delete(exeToolPath); } catch {}
                    try { File.Delete(archivePath); } catch {}
                    
                    File.WriteAllText(versionFile, BuildVersion);
                }
                
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = exePath;
                psi.WorkingDirectory = appDir;
                psi.UseShellExecute = false;
                
                string[] args = Environment.GetCommandLineArgs();
                if (args.Length > 1)
                {
                    psi.Arguments = string.Join(" ", args.Skip(1).Select(a => "\\\"" + a + "\\\""));
                }
                
                Process.Start(psi);
            }
            catch (Exception ex)
            {
                System.Windows.Forms.MessageBox.Show("Failed to launch AnimePaint:\\n" + ex.Message, "Launcher Error", System.Windows.Forms.MessageBoxButtons.OK, System.Windows.Forms.MessageBoxIcon.Error);
            }
        }
    }
}
`;
    fs.writeFileSync(programCsPath, csharpCode7z.trim());
    
    // Compile using 7z.exe and app.7z resources
    const compileCmd = `"${cscPath}" /target:winexe /win32icon:"${path.join(WORKSPACE, 'app.ico')}" /resource:"${archive7zPath}",app.7z /resource:"${local7zExe}",7z.exe /out:"${finalExePath}" /reference:System.dll /reference:System.Windows.Forms.dll "${programCsPath}"`;
    console.log(`Running: ${compileCmd}`);
    execSync(compileCmd, { stdio: 'inherit' });
    
} else {
    console.log('--- 7-ZIP NOT FOUND, FALLING BACK TO STANDARD ZIP DEFINE ---');
    
    const zipPath = path.join(distAppDir, 'app.zip');
    const compressCmd = `powershell -Command "Compress-Archive -Path '${appFolder}\\*' -DestinationPath '${zipPath}' -Force"`;
    console.log(`Running: ${compressCmd}`);
    execSync(compressCmd, { stdio: 'inherit' });
    
    const csharpCodeZip = `
using System;
using System.IO;
using System.Diagnostics;
using System.Reflection;
using System.IO.Compression;
using System.Linq;

namespace AnimePaintLauncher
{
    static class Program
    {
        private const string BuildVersion = "${buildVersion}";

        [STAThread]
        static void Main()
        {
            try
            {
                string tempRoot = Path.Combine(Path.GetTempPath(), "AnimePaint_Maria_Core_Final");
                string appDir = Path.Combine(tempRoot, "app");
                string exePath = Path.Combine(appDir, "AnimePaint.exe");
                string versionFile = Path.Combine(appDir, "version.txt");
                
                bool needsExtraction = true;
                if (Directory.Exists(appDir) && File.Exists(exePath) && File.Exists(versionFile))
                {
                    try
                    {
                        string extractedVersion = File.ReadAllText(versionFile).Trim();
                        if (extractedVersion == BuildVersion)
                        {
                            needsExtraction = false;
                        }
                    }
                    catch {}
                }
                
                if (needsExtraction)
                {
                    if (Directory.Exists(tempRoot))
                    {
                        try { Directory.Delete(tempRoot, true); } catch {}
                    }
                    Directory.CreateDirectory(tempRoot);
                    
                    Assembly assembly = Assembly.GetExecutingAssembly();
                    string resourceName = assembly.GetManifestResourceNames().FirstOrDefault(r => r.EndsWith("app.zip"));
                    if (resourceName == null) throw new Exception("Resource app.zip not found.");
                    
                    string zipPath = Path.Combine(tempRoot, "app.zip");
                    using (Stream stream = assembly.GetManifestResourceStream(resourceName))
                    using (FileStream fileStream = new FileStream(zipPath, FileMode.Create, FileAccess.Write))
                    {
                        stream.CopyTo(fileStream);
                    }
                    
                    ZipFile.ExtractToDirectory(zipPath, appDir);
                    try { File.Delete(zipPath); } catch {}
                    
                    File.WriteAllText(versionFile, BuildVersion);
                }
                
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = exePath;
                psi.WorkingDirectory = appDir;
                psi.UseShellExecute = false;
                
                string[] args = Environment.GetCommandLineArgs();
                if (args.Length > 1)
                {
                    psi.Arguments = string.Join(" ", args.Skip(1).Select(a => "\\\"" + a + "\\\""));
                }
                
                Process.Start(psi);
            }
            catch (Exception ex)
            {
                System.Windows.Forms.MessageBox.Show("Failed to launch AnimePaint:\\n" + ex.Message, "Launcher Error", System.Windows.Forms.MessageBoxButtons.OK, System.Windows.Forms.MessageBoxIcon.Error);
            }
        }
    }
}
`;
    fs.writeFileSync(programCsPath, csharpCodeZip.trim());
    
    const compileCmd = `"${cscPath}" /target:winexe /win32icon:"${path.join(WORKSPACE, 'app.ico')}" /resource:"${zipPath}",app.zip /out:"${finalExePath}" /reference:System.IO.Compression.FileSystem.dll /reference:System.IO.Compression.dll /reference:System.dll /reference:System.Windows.Forms.dll "${programCsPath}"`;
    console.log(`Running: ${compileCmd}`);
    execSync(compileCmd, { stdio: 'inherit' });
}

console.log('----------------------------------------------------');
console.log(`SUCCESS! Executable compiled and written to:`);
console.log(finalExePath);
console.log(`Final file size: ${(fs.statSync(finalExePath).size / (1024 * 1024)).toFixed(2)} MB`);
console.log('----------------------------------------------------');
