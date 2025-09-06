package com.example.myapp

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val wv = WebView(this)
    wv.settings.javaScriptEnabled = true
    wv.webViewClient = WebViewClient()
    wv.loadUrl("file:///android_asset/index.html")
    setContentView(wv)
  }
}
