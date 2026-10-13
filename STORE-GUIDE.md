# Getting Shift Score into the App Store and Google Play

The code side is done: the iOS and Android apps, icons, splash screens, privacy policy, terms, store text and screenshots are all in this repo. What's left needs your Apple ID, your Google account and your Mac. Plan on an evening for setup, then waiting on reviews.

## What's already built

| Store requirement | Where it is |
|---|---|
| App wrapper (Capacitor) | `ios/` and `android/` folders, `capacitor.config.json` |
| App icons, every size | Generated into both projects. Source art in `assets/` |
| Splash screens (light and dark) | Generated into both projects |
| Phone storage that survives | Every save is also kept in the app's own storage and restored if iOS clears the web data |
| Accurate pay timer in the background | The counter is based on your clock-in time, so it's exact after the app was closed. It redraws the moment you reopen it |
| Native features (Apple looks for these) | Haptic tap on clock in/out, "Still on the clock?" reminder after 9 hours, share sheet for Excel/Word/backup files |
| Privacy policy + terms | Live at kg0712.github.io/Shift-Score/privacy.html and /terms.html, and linked inside the app |
| Store listing text | `store/LISTING.md`, ready to paste |
| Screenshots + graphics | `store/` (iPhone 6.9", Android phone, Play feature graphic, icons) |

Bundle ID / package name: `io.github.kg0712.shiftscore`. This can't change after your first upload. If you'd rather publish under a different name (for example your LLC), say so before step 4 and I'll switch it.

## 1. Create the developer accounts

**Apple Developer Program: $99 a year**
1. Go to developer.apple.com/programs/enroll and sign in with your Apple ID (2-factor must be on).
2. Enroll as an **Individual** (your name shows as the seller). Enrolling as a business needs a D-U-N-S number for the LLC and takes longer.
3. Approval is usually within 48 hours.

**Google Play Console: $25 one time**
1. Go to play.google.com/console/signup.
2. Choose a **Personal** account and verify your identity (government ID) and an Android device.
3. New personal accounts must run a **closed test with at least 12 testers for 14 days in a row** before they can publish publicly. Line up 12 friends with Android phones early. Each tester needs to stay opted in the whole 14 days.

## 2. Install the tools on your Mac

1. **Xcode** from the Mac App Store (large download). Open it once and let it install components.
2. **Android Studio** from developer.android.com/studio. Open it once and finish the setup wizard (it downloads the Android SDK).
3. **Node.js** (LTS) from nodejs.org.

## 3. Get the project on your Mac

In Terminal:

```bash
cd ~/Documents
git clone https://github.com/KG0712/Shift-Score.git
cd Shift-Score
npm install
npm run sync
```

`npm run sync` copies the latest web app into both native projects. Run it again any time the app changes.

## 4. iPhone: test, then submit

1. `npm run ios` opens the project in Xcode.
2. Click **App** in the left sidebar → **Signing & Capabilities** → set **Team** to your Apple Developer account. Leave "Automatically manage signing" on.
3. Plug in your iPhone, pick it at the top of Xcode and press ▶ to try the app on your phone. The first time, approve the developer under iPhone Settings → General → VPN & Device Management.
4. In App Store Connect (appstoreconnect.apple.com) → **Apps → + → New App**: platform iOS, name "Shift Score: Pay Tracker", bundle ID `io.github.kg0712.shiftscore`, SKU `shiftscore`.
5. Back in Xcode: set the device to **Any iOS Device (arm64)** → **Product → Archive** → **Distribute App → App Store Connect → Upload**.
6. In App Store Connect, fill in every field from `store/LISTING.md`, upload the screenshots from `store/screenshots-iphone/`, set App Privacy to "Data Not Collected", pick the build you uploaded and press **Submit for Review**.
7. Review usually takes 1 to 3 days. Optional: test with friends first through **TestFlight** (same build, no review wait for internal testers).

## 5. Android: test, closed test, then publish

1. `npm run android` opens the project in Android Studio. Let Gradle finish syncing.
2. To try it: plug in an Android phone with USB debugging on (or start an emulator) and press ▶.
3. Make the release file: **Build → Generate Signed App Bundle or APK → Android App Bundle → Create new keystore**.
   - Save the keystore file and both passwords somewhere safe (a password manager plus a backup). **If you lose it you can't publish updates to the same listing.**
   - Choose **release** and finish. Your file is `android/app/release/app-release.aab`.
4. In Play Console → **Create app**: name "Shift Score: Pay Tracker", app, free.
5. Complete the **Set up your app** checklist using `store/LISTING.md` (privacy policy URL, app access, ads, content rating, target audience, data safety, store listing and graphics from `store/`).
6. **Testing → Closed testing → Create track**, upload the `.aab`, add your 12+ testers' Gmail addresses and roll it out. Send them the opt-in link.
7. After 14 days with 12+ testers opted in, Play Console unlocks **Apply for production**. Answer the short questionnaire, then release to Production. Review usually takes a few days.

## Updating the app later

1. Make the change (or ask Claude to).
2. Raise the version: in Xcode, App target → General → Version and Build; in `android/app/build.gradle`, `versionCode` (+1 every upload) and `versionName`.
3. `npm run sync`, then archive and upload again (steps 4.5 and 5.3).

The website at kg0712.github.io/Shift-Score updates on its own when changes are pushed. The store apps only change when you upload a new build.

## Commands

| Command | What it does |
|---|---|
| `npm run build` | Rebuilds the `www/` folder the apps load |
| `npm run sync` | Build + copy into the iOS and Android projects |
| `npm run ios` | Sync + open Xcode |
| `npm run android` | Sync + open Android Studio |
| `npm run assets` | Regenerate icons and splash screens from `assets/` |
