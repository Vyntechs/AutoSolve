# Apple App Store Submission Checklist
## AutoSolve v1.1.0 - Final Binary Validation

**CRITICAL**: Complete ALL items in this checklist before submitting to App Store Connect.

---

## ✅ COMPLETED: Code Remediation

The following compliance issues have been fixed in the codebase:

- ✅ **App Identity**: Changed app name from "vibecode" to "AutoSolve" in app.json
- ✅ **Placeholder Text**: Removed "VIN lookup coming soon" from OnboardingModal
- ✅ **TODO Comments**: Removed all TODO comments from production code
- ✅ **iPad Support**: Verified supportsTablet=true (app supports iPad)
- ✅ **Terms of Service**: Added Apple EULA disclaimer to subscription terms
- ✅ **Legal Links**: Privacy Policy and Terms links present on paywall (previously completed)

---

## 🔴 CRITICAL: Permission Audit (MUST COMPLETE BEFORE SUBMISSION)

**Apple Policy**: Apps requesting unused permissions will be **automatically rejected**.

### Step 1: Generate iOS Build
Run the following commands on your Mac:

```bash
cd /path/to/autosolve
bun install
npx expo prebuild --platform ios --clean
```

### Step 2: Inspect Info.plist for Unused Permissions

```bash
# Check for all usage description keys
grep -A 2 "UsageDescription" ios/AutoSolve/Info.plist
```

### Step 3: Verify NO Unused Permissions Exist

The app **MUST NOT** include these keys (since features aren't used):

❌ **FORBIDDEN KEYS** (will cause rejection):
- `NSCameraUsageDescription` - Camera not used
- `NSPhotoLibraryUsageDescription` - Photo library not used
- `NSPhotoLibraryAddUsageDescription` - Photo library not used
- `NSLocationWhenInUseUsageDescription` - Location not used
- `NSLocationAlwaysUsageDescription` - Location not used
- `NSLocationAlwaysAndWhenInUseUsageDescription` - Location not used
- `NSContactsUsageDescription` - Contacts not used
- `NSMicrophoneUsageDescription` - Microphone not used
- `NSCalendarsUsageDescription` - Calendar not used
- `NSRemindersUsageDescription` - Reminders not used
- `NSMotionUsageDescription` - Motion not used
- `NSSensorUsageDescription` - Sensors not used

✅ **ALLOWED KEYS** (app uses these):
- `NSAppTransportSecurity` - Network requests (OpenAI, RevenueCat)
- `UIBackgroundModes` - Background fetch (if needed)

### Step 4: If Forbidden Keys Found - Remove Them

**Option A: Remove via app.json plugin** (recommended)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "infoPlist": {
              "NSCameraUsageDescription": null,
              "NSPhotoLibraryUsageDescription": null,
              "NSLocationWhenInUseUsageDescription": null,
              "NSContactsUsageDescription": null,
              "NSMicrophoneUsageDescription": null
            }
          }
        }
      ]
    ]
  }
}
```

**Option B: Manually edit Info.plist**
- Open `ios/AutoSolve/Info.plist`
- Delete any `NSXXXUsageDescription` keys not listed as ALLOWED above
- Save file

**Option C: Remove unused packages from package.json**
If the keys are added by unused packages:
- expo-camera (not used)
- expo-contacts (not used)
- expo-location (not used)
- expo-media-library (not used)

Only remove if you're confident they're not indirect dependencies.

### Step 5: Rebuild and Re-verify

```bash
npx expo prebuild --platform ios --clean
grep -A 2 "UsageDescription" ios/AutoSolve/Info.plist
```

**Expected output**: ONLY allowed keys, NO forbidden keys.

---

## 🟡 REQUIRED: RevenueCat & IAP Configuration

### Verify Products in RevenueCat Dashboard

1. **Log into RevenueCat Dashboard**: https://app.revenuecat.com
2. **Navigate to your AutoSolve project**
3. **Verify the following products exist:**
   - ✅ Package identifier: `$rc_weekly`
   - ✅ Entitlement: `premium`
   - ✅ Product pushed to **App Store** (not just Test Store)

4. **If products missing or only in Test Store:**
   - Create weekly subscription product
   - Attach to "premium" entitlement
   - **CRITICAL**: Push to App Store using RevenueCat dashboard

### Create IAP in App Store Connect

1. **Log into App Store Connect**: https://appstoreconnect.apple.com
2. **Navigate to**: My Apps → AutoSolve → In-App Purchases
3. **Create Auto-Renewable Subscription:**
   - Product ID: Must match RevenueCat product ID
   - Reference Name: AutoSolve Premium Weekly
   - Subscription Group: Create "Premium Subscriptions" group
   - Duration: 1 Week
   - Price: $4.99 USD

4. **Add subscription information:**
   - Subscription Display Name: Premium Access
   - Description: Unlock 20 scans per week and full access to diagnostic tools
   - Review Screenshot: Screenshot of paywall screen

5. **Add Free Trial:**
   - Offer Type: Introductory Offer
   - Duration: 2 Days
   - Price: Free

6. **Submit IAP for Review**
   - Click "Submit for Review" on IAP page
   - IAP must be submitted **BEFORE** app binary

---

## 🟢 RECOMMENDED: Pre-Submission Testing

### Build & Test in Xcode Simulator

```bash
# Open project in Xcode
open ios/AutoSolve.xcworkspace

# Select iPad Pro 12.9" simulator
# Press Cmd+R to build and run
```

### Verify App Launch
- ✅ App launches without crashes
- ✅ NO permission prompts appear
- ✅ Onboarding modal shows (first launch)
- ✅ No "VIN lookup coming soon" text visible

### Test Core Flows
- ✅ Vehicle input form works
- ✅ Issue description accepts input
- ✅ Scan button shows (may not work in simulator - requires API keys)
- ✅ History tab accessible
- ✅ Tools tab accessible
- ✅ Settings tab accessible

### Test Paywall Screen
- ✅ Navigate to Settings → tap Premium badge OR trigger scan limit
- ✅ Paywall displays subscription price: $4.99/week
- ✅ Trial offer shown: "2-day free trial"
- ✅ Legal links present at bottom
- ✅ Tap "Privacy Policy" → opens Safari to forgesights.com
- ✅ Tap "Terms of Use" → opens Safari to Apple EULA

### Take iPad Screenshots (Required for App Store)

With iPad Pro 12.9" simulator open:
1. Navigate to each key screen
2. Press **Cmd+S** to save screenshot
3. Screenshots save to Desktop

**Required screenshots (at minimum):**
- Home screen with vehicle input
- Paywall screen showing pricing and legal links
- Tools screen
- Settings screen

Resolution: 2048 x 2732 pixels (verified automatically)

---

## 📋 App Store Connect Setup

### App Information

- **Name**: AutoSolve
- **Subtitle**: AI Vehicle Diagnostic Assistant
- **Category**: Utilities
- **Content Rights**: Contains third-party content (OpenAI)

### App Privacy

**Data Collection Disclosure** (must match Privacy Policy):

1. **Identifiers** → Device ID
   - Purpose: App Functionality
   - Collected by: RevenueCat (subscriptions)
   - Linked to User: No

2. **Usage Data** → Product Interaction
   - Purpose: App Functionality
   - Collected by: AutoSolve
   - Linked to User: No

3. **User Content** → Other User Content
   - Data: Vehicle info, diagnostic data
   - Purpose: App Functionality
   - Collected by: AutoSolve, OpenAI
   - Linked to User: No

**Third-Party Partners:**
- OpenAI (AI diagnostics)
- RevenueCat (subscription management)

**Privacy Policy URL**: https://www.forgesights.com/autosolve/privacy

### Version Information

- **Version**: 1.1.0
- **Copyright**: 2024 VynTechs
- **Build**: (Auto-generated during upload)

---

## 🚀 Final Pre-Submission Checklist

Before clicking "Submit for Review":

- [ ] Info.plist contains NO unused permission keys (verified above)
- [ ] App name is "AutoSolve" in Xcode project settings
- [ ] IAP subscription created in App Store Connect
- [ ] IAP submitted for review BEFORE app binary
- [ ] RevenueCat product pushed to App Store (not just Test Store)
- [ ] Privacy Policy URL verified live: https://www.forgesights.com/autosolve/privacy
- [ ] App Store screenshots uploaded (iPhone + iPad if supporting tablet)
- [ ] App description mentions AI-powered diagnostics
- [ ] App description mentions OpenAI usage (for transparency)
- [ ] TestFlight build tested with real device
- [ ] No crashes on launch
- [ ] No permission prompts on launch
- [ ] Paywall legal links functional

---

## 📝 App Review Notes (Include in App Store Connect)

**Recommended text for "Notes" field:**

```
AutoSolve is an AI-powered vehicle diagnostic assistant for informational purposes.

SUBSCRIPTION TESTING:
- Free tier: 2 scans/week (no purchase required)
- Premium tier: Available via in-app purchase ($4.99/week with 2-day free trial)
- Test IAP: Use App Store Sandbox tester account

THIRD-PARTY SERVICES:
- OpenAI API: Used for AI diagnostic analysis (requires API key)
- RevenueCat: Subscription management

DEMO ACCOUNT: Not required - app functions without login.

IMPORTANT: The app does NOT replace professional automotive diagnosis. All recommendations are for informational guidance only.
```

---

## ⚠️ Common Rejection Reasons & Prevention

### Rejection: 2.1 - App Completeness
**Cause**: IAP products not submitted or missing
**Prevention**: Submit IAP for review BEFORE app binary ✅

### Rejection: 2.3 - Accurate Metadata
**Cause**: App name mismatch
**Prevention**: Changed to "AutoSolve" in app.json ✅

### Rejection: 3.1.2 - Subscriptions
**Cause**: Missing legal links on paywall
**Prevention**: Privacy Policy and Terms links present ✅

### Rejection: 5.1.1 - Privacy
**Cause**: Unused permissions in Info.plist
**Prevention**: Complete permission audit above ⚠️ **REQUIRED**

---

## 📞 Support Contacts

**Apple Developer Support**: https://developer.apple.com/contact/
**RevenueCat Support**: https://www.revenuecat.com/support
**App Issues**: support@Vyntechs.com

---

## ✅ FINAL SIGN-OFF

Before submitting to App Store Connect, confirm:

**I have completed the following:**
- [ ] Permission audit (Info.plist verified)
- [ ] IAP created and submitted in App Store Connect
- [ ] RevenueCat products pushed to App Store
- [ ] TestFlight build tested on real device
- [ ] No permission prompts on launch
- [ ] Legal links functional on paywall
- [ ] App Store screenshots uploaded
- [ ] Privacy details entered in App Store Connect

**Submitted by**: _________________
**Date**: _________________
**Build Number**: _________________

---

**Last Updated**: December 12, 2025
**App Version**: 1.1.0
**Compliance Status**: Ready for final validation
