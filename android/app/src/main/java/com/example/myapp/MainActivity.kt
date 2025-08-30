package com.example.myapp

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val tv = TextView(this).apply {
      text = "Hello from APK builder 👋"
      textSize = 20f
      setPadding(32, 32, 32, 32)
    }
    setContentView(tv)
  }
}
