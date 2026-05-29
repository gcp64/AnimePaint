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

// 2. Build languages
console.log('Building language bundles...');
execSync('npm run lang:build', { stdio: 'inherit' });

// 3. Build frontend bundle
console.log('Building frontend production bundle via Parcel...');
execSync('npm run build', { stdio: 'inherit' });

// 4. Run electron-packager
console.log('Packaging application with electron-packager...');
const ignorePattern = '/(\\.git|\\.github|\\.npm-cache|\\.electron-cache|\\.parcel-cache|node_modules|dist-app|src|examples|build_pack\\.js|task\\.md|implementation_plan\\.md|walkthrough\\.md)($|/)';
const packagerCmd = `npx electron-packager . AnimePaint --platform=win32 --arch=x64 --out=dist-app --overwrite --icon=app.ico --ignore="${ignorePattern}"`;
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

// Prune source maps (*.map) in packaged app to save space
const packagedDistDir = path.join(appFolder, 'resources', 'app', 'dist');
if (fs.existsSync(packagedDistDir)) {
    console.log('Pruning source maps (*.map) in packaged app...');
    const files = fs.readdirSync(packagedDistDir);
    let mapDeletedCount = 0;
    files.forEach(file => {
        if (file.endsWith('.map')) {
            fs.unlinkSync(path.join(packagedDistDir, file));
            mapDeletedCount++;
        }
    });
    console.log(`Deleted ${mapDeletedCount} source map files.`);
}

// 5.5 Write build version file to detect updates
const buildVersion = Date.now().toString();
const versionFilePath = path.join(appFolder, 'resources', 'app', 'version.txt');
fs.writeFileSync(versionFilePath, buildVersion);
console.log(`Version file written with code: ${buildVersion}`);

// 6. Zip the packaged folder using native PowerShell Compress-Archive
console.log('Compressing packaged folder to app.zip...');
const zipPath = path.join(distAppDir, 'app.zip');
const compressCmd = `powershell -Command "Compress-Archive -Path '${appFolder}\\*' -DestinationPath '${zipPath}' -Force"`;
console.log(`Running: ${compressCmd}`);
execSync(compressCmd, { stdio: 'inherit' });
console.log('Zip file created successfully.');

// 7. Create Program.cs launcher code
console.log('Creating C# self-extractor Program.cs...');
const programCsPath = path.join(distAppDir, 'Program.cs');
const csharpCode = `
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
                    if (resourceName == null)
                    {
                        throw new Exception("Embedded resource app.zip not found.");
                    }
                    
                    string zipPath = Path.Combine(tempRoot, "app.zip");
                    using (Stream stream = assembly.GetManifestResourceStream(resourceName))
                    using (FileStream fileStream = new FileStream(zipPath, FileMode.Create, FileAccess.Write))
                    {
                        stream.CopyTo(fileStream);
                    }
                    
                    ZipFile.ExtractToDirectory(zipPath, appDir);
                    try { File.Delete(zipPath); } catch {}
                }
                
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = exePath;
                psi.WorkingDirectory = appDir;
                psi.UseShellExecute = false;
                
                string[] args = Environment.GetCommandLineArgs();
                if (args.Length > 1)
                {
                    psi.Arguments = string.Join(" ", args.Skip(1).Select(a => "\\"" + a + "\\""));
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
fs.writeFileSync(programCsPath, csharpCode.trim());
console.log('Program.cs written.');

// 8. Compile C# executable via csc.exe directly to User Desktop
console.log('Compiling C# launcher using csc.exe...');
const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
const desktopDir = path.join(process.env.USERPROFILE || 'C:\\Users\\default', 'Desktop');
const finalExePath = path.join(desktopDir, 'AnimePaint_Maria_Core_Final.exe');

const compileCmd = `"${cscPath}" /target:winexe /win32icon:"${path.join(WORKSPACE, 'app.ico')}" /resource:"${zipPath}",app.zip /out:"${finalExePath}" /reference:System.IO.Compression.FileSystem.dll /reference:System.IO.Compression.dll /reference:System.dll /reference:System.Windows.Forms.dll "${programCsPath}"`;
console.log(`Running: ${compileCmd}`);
execSync(compileCmd, { stdio: 'inherit' });

console.log('----------------------------------------------------');
console.log(`SUCCESS! Executable compiled and written to:`);
console.log(finalExePath);
console.log(`Final file size: ${(fs.statSync(finalExePath).size / (1024 * 1024)).toFixed(2)} MB`);
console.log('----------------------------------------------------');
