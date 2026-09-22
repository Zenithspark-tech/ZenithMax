# ZenithMax — Android Studio packaging plan

## Recommended method

Use Android Studio to build a small native Android shell around the HTTPS ZenithMax site. Keep the web app as the shared product surface, while the Android shell provides:

- camera/microphone permission handling for calls
- file chooser support for uploads
- download handling
- deep links into video/chat/call pages
- back-button navigation
- splash screen and ZenithMax icon

## Google Play target

As of August 31, 2026, new Android apps and app updates submitted to Google Play must target Android 16 / API 36 or higher (subject to the Play policy exceptions/extensions shown in Play Console).

## Suggested Android Studio structure

```text
android/
  app/
    src/main/AndroidManifest.xml
    src/main/java/.../MainActivity.kt
    src/main/res/
      drawable/
      mipmap-anydpi-v26/
      values/
  build.gradle.kts
  settings.gradle.kts
```

The WebView should load your Render HTTPS URL, not an HTTP development address.

Before Play submission, test:

- sign-in persistence
- image/video selection
- video upload/resume behavior
- media playback with sound
- camera/microphone permissions
- notification behavior
- download handling
- external links
- rotation/background/resume

Use an Android App Bundle (`.aab`) for Google Play.
