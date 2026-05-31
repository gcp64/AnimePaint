package com.example.animepaint

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ContentValues
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.view.Window
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import android.util.Base64

class MainActivity : Activity() {
    private var webView: WebView? = null
    private var uploadMessage: ValueCallback<Array<Uri>>? = null
    private val FILECHOOSER_RESULTCODE = 1

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        requestWindowFeature(Window.FEATURE_NO_TITLE)

        val wv = WebView(this)
        webView = wv
        setContentView(wv)

        wv.addJavascriptInterface(AndroidBridge(this), "AndroidBridge")

        wv.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                injectDownloader(view)
            }
        }

        wv.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                if (filePathCallback == null) return false
                
                uploadMessage?.onReceiveValue(null)
                uploadMessage = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "image/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }
                try {
                    startActivityForResult(intent, FILECHOOSER_RESULTCODE)
                } catch (e: Exception) {
                    uploadMessage?.onReceiveValue(null)
                    uploadMessage = null
                    return false
                }
                return true
            }
        }

        wv.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            databaseEnabled = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(true)
            builtInZoomControls = false
            displayZoomControls = false
        }
        wv.loadUrl("file:///android_asset/dist/index.html")
    }

    override fun onBackPressed() {
        val wv = webView
        if (wv != null && wv.canGoBack()) {
            wv.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (uploadMessage == null) return
            val result = if (data == null || resultCode != RESULT_OK) null else data.data
            if (result != null) {
                uploadMessage?.onReceiveValue(arrayOf(result))
            } else {
                uploadMessage?.onReceiveValue(null)
            }
            uploadMessage = null
        } else {
            super.onActivityResult(requestCode, resultCode, data)
        }
    }

    private fun injectDownloader(view: WebView?) {
        val js = """
            (function() {
                window.addEventListener('click', function(e) {
                    var target = e.target;
                    while (target && target.tagName !== 'A') {
                        target = target.parentNode;
                    }
                    if (target && target.hasAttribute('download')) {
                        e.preventDefault();
                        var href = target.getAttribute('href');
                        var filename = target.getAttribute('download') || 'image.png';
                        if (href.startsWith('data:')) {
                            var parts = href.split(',');
                            var base64 = parts[1];
                            var mime = parts[0].split(';')[0].split(':')[1];
                            window.AndroidBridge.downloadFile(base64, filename, mime);
                        } else if (href.startsWith('blob:')) {
                            fetch(href)
                                .then(response => response.blob())
                                .then(blob => {
                                    var reader = new FileReader();
                                    reader.onloadend = function() {
                                        var base64 = reader.result.split(',')[1];
                                        window.AndroidBridge.downloadFile(base64, filename, blob.type);
                                    };
                                    reader.readAsDataURL(blob);
                                        });
                                }
                            }
                        }, true);
                    })();
        """.trimIndent()
        view?.evaluateJavascript(js, null)
    }

    class AndroidBridge(private val activity: Activity) {
        @JavascriptInterface
        fun downloadFile(base64Data: String, fileName: String, mimeType: String) {
            try {
                val bytes = Base64.decode(base64Data, Base64.DEFAULT)
                val resolver = activity.contentResolver
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                    put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                }
                
                val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                if (uri != null) {
                    resolver.openOutputStream(uri)?.use { outputStream ->
                        outputStream.write(bytes)
                    }
                    activity.runOnUiThread {
                        Toast.makeText(activity, "Saved image to Downloads: $fileName", Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                activity.runOnUiThread {
                    Toast.makeText(activity, "Failed to save: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
