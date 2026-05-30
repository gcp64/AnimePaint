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

    console.log('--- USING STANDARD ZIP COMPRESSION FOR MAXIMUM EXTRACTION STABILITY ---');
    
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
                // 1. Release locks by killing any running AnimePaint process
                foreach (var process in Process.GetProcessesByName("AnimePaint"))
                {
                    try
                    {
                        process.Kill();
                        process.WaitForExit(3000);
                    }
                    catch {}
                }

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
                    Directory.CreateDirectory(appDir);
                    
                    Assembly assembly = Assembly.GetExecutingAssembly();
                    string resourceName = assembly.GetManifestResourceNames().FirstOrDefault(r => r.EndsWith("app.zip"));
                    if (resourceName == null) throw new Exception("Resource app.zip not found.");
                    
                    string zipPath = Path.Combine(tempRoot, "app.zip");
                    using (Stream stream = assembly.GetManifestResourceStream(resourceName))
                    using (FileStream fileStream = new FileStream(zipPath, FileMode.Create, FileAccess.Write))
                    {
                        stream.CopyTo(fileStream);
                    }
                    
                    // Extract manually with overwrite to handle left-over locked files gracefully
                    using (ZipArchive archive = ZipFile.OpenRead(zipPath))
                    {
                        foreach (ZipArchiveEntry entry in archive.Entries)
                        {
                            string normalizedPath = entry.FullName.Replace('/', Path.DirectorySeparatorChar);
                            string destinationPath = Path.Combine(appDir, normalizedPath);
                            
                            if (normalizedPath.EndsWith(Path.DirectorySeparatorChar.ToString()))
                            {
                                if (!Directory.Exists(destinationPath))
                                {
                                    Directory.CreateDirectory(destinationPath);
                                }
                                continue;
                            }
                            
                            string dir = Path.GetDirectoryName(destinationPath);
                            if (!Directory.Exists(dir))
                            {
                                Directory.CreateDirectory(dir);
                            }
                            
                            entry.ExtractToFile(destinationPath, true);
                        }
                    }
                    
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

console.log('----------------------------------------------------');
console.log(`SUCCESS! Executable compiled and written to:`);
console.log(finalExePath);
console.log(`Final file size: ${(fs.statSync(finalExePath).size / (1024 * 1024)).toFixed(2)} MB`);
console.log('----------------------------------------------------');
