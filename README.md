# AutoSolve - AI Diagnostic Assistant

**Version**: 1.1.0
**Status**: ✅ App Store Submission Ready
**Last Updated**: December 12, 2025

A modern, minimal automotive AI diagnostic assistant built with React Native and Expo. Features GPT-4 powered diagnostics and crowdsourced repair outcome database.

---

## 🚀 App Store Submission Status

This app has completed Apple App Store pre-submission compliance remediation:

✅ **App Identity**: Configured as "AutoSolve"
✅ **Placeholder Content**: Removed all incomplete feature references
✅ **Legal Compliance**: Privacy Policy and Terms links on paywall
✅ **Terms of Service**: Apple EULA disclaimer added
✅ **Production Code**: All TODO comments removed

⚠️ **CRITICAL - Complete Before Submission:**
- [ ] Run Info.plist permission audit (see `APP_STORE_SUBMISSION_CHECKLIST.md`)
- [ ] Create IAP subscription in App Store Connect
- [ ] Verify RevenueCat products pushed to App Store

📋 **See**: `APP_STORE_SUBMISSION_CHECKLIST.md` for complete submission instructions

---

## Data Collection & Usage

AutoSolve collects and uses the following data to provide diagnostic services and improve the community database:

### Data We Collect

1. **Vehicle Information**
   - Year, make, model, and engine type
   - VIN numbers (when using VIN decoder)
   - Purpose: To provide accurate, vehicle-specific diagnostic recommendations
   - Storage: Stored locally on your device only

2. **Diagnostic Input**
   - DTC (diagnostic trouble codes)
   - Symptom descriptions
   - Purpose: To analyze issues and generate AI-powered diagnostic paths
   - Storage: Stored locally on your device and sent to OpenAI GPT-4 API for analysis

3. **Repair Outcomes** (optional, user-submitted)
   - What solution worked (selected from AI suggestions or custom)
   - Whether repair was DIY or shop-performed
   - Cost and time spent
   - Success rating (1-5 stars)
   - Purpose: To build a crowdsourced database that helps future users see what actually works
   - Storage: Stored locally on your device and anonymized for community aggregation

4. **Usage Data**
   - Number of diagnostic scans performed
   - Subscription status and tier
   - Purpose: To enforce scan limits and manage subscriptions
   - Storage: Stored locally on your device and synced with RevenueCat for subscription management

### Data We DO NOT Collect
- **No Personal Information**: We do not collect your name, email, phone number, or any personally identifiable information
- **No Location Data**: We do not collect or track your IP address, GPS location, or any location data
- **No Device Identifiers**: We do not collect device IDs, advertising IDs, or other tracking identifiers beyond what RevenueCat requires for subscription management
- **No Browsing History**: We do not track your usage patterns or behavior outside of scan counts

### How We Use Your Data

**AI Diagnostics (OpenAI GPT-4)**
- When you perform a diagnostic scan, the following data is sent to OpenAI:
  - Vehicle year, make, model, and engine type
  - DTC codes and symptom descriptions
- OpenAI uses this data to generate diagnostic recommendations
- **OpenAI Data Retention**: According to OpenAI policy (as of 2025), API data is retained for 30 days for abuse monitoring, then deleted. OpenAI does not use API data to train their models.
- **Purpose**: To provide you with accurate, AI-powered diagnostic analysis

**Community Insights**
- Repair outcomes you submit are anonymized and aggregated with other users' data
- Only the following anonymized data is shared: vehicle year/make/model, DTC codes, symptom keywords, repair solution, success rate, cost range, and time range
- No personal information, location data, or device identifiers are included
- **Purpose**: To show future users what repairs have worked for similar issues

**Subscription Management (RevenueCat)**
- RevenueCat processes subscription payments and tracks your subscription status
- RevenueCat collects minimal identifiers necessary for subscription management
- **Purpose**: To manage your subscription tier and enforce scan limits

### Data Storage

**Local Storage (On Your Device)**
- Vehicle information and preferences
- Diagnostic history
- Usage counts
- Settings and configurations
- Data persists until you delete the app

**Third-Party Services**
- **OpenAI**: Receives diagnostic requests, retains for 30 days, then deletes
- **RevenueCat**: Manages subscriptions and stores minimal subscription data
- No other third-party services have access to your data

### Privacy Commitment

- All data is stored locally on your device first
- Only diagnostic requests are sent to OpenAI for AI analysis
- All repair outcome data is fully anonymized before aggregation
- We do not sell, share, or monetize your personal data
- You can delete all local data by uninstalling the app

## Features

### Core Diagnostic Features
- **Vehicle Intake**: Text input fields for year/make/model/engine (simplified from dropdowns)
- **Unified Issue Description**: Single text field for DTC codes and symptoms combined
  - Smart DTC extraction via regex pattern matching
  - Examples: "P0304, engine runs rough, check engine light on"
- **AI-Powered Diagnostics**: GPT-4 powered diagnostic analysis with Master Tech persona
  - Multi-path diagnostic recommendations
  - Severity ratings and confidence scores
  - Step-by-step diagnostic procedures
  - Cost estimates and safety warnings
  - Pro tips for mechanics

### Apple-Quality Animations & Polish
- **Animated Scan Button**: 5-step progress animation with:
  - Shimmer effect overlay
  - Pulsing scale animation
  - Rotating step icons
  - Progress bar with step indicators
  - Haptic feedback at each step
- **Staggered Diagnostic Results**: Smooth entry animations
  - Summary card with fade-in
  - Diagnostic paths with staggered delays
  - Steps slide in from right
  - Confidence badges zoom in
  - Safety warnings fade in last
- **Community Data Animations**:
  - Animated progress bar for success rate
  - Staggered solution entries
  - Icon zoom animations
  - Button press micro-interactions

### What Fixed It - Crowdsourced Repair Database
A community-driven repair outcome database that builds as more users contribute:
- **Repair Outcome Collection**: Follow-up system asks users what worked after 3 days
- **Community Statistics**: Shows success rates, average costs, and repair times
- **Top Solutions**: Ranked by success rate from real user experiences
- **Cost Distribution**: Breakdown of repair costs (<$100, $100-500, $500-1k, $1k+)
- **DIY Friendly Indicators**: Shows which repairs are commonly done DIY
- **Privacy-First**: All data is anonymized and used to help the community

### Subscription System
- **Free Tier**: 2 diagnostic scans per week
- **Trial**: 2-day free trial with 10 diagnostic scans
- **Premium Tier**: 20 scans per week at $4.99/week via RevenueCat
- Usage tracking with weekly reset
- **Legal Compliance**: Privacy Policy and Terms of Use links on paywall (Apple App Store Guideline 3.1.2)

### Tools & Utilities
- **VIN Decoder**: Decode 17-character VIN numbers
- **OBD-II Codes**: Reference library for diagnostic codes
- **Unit Converter**: Convert between metric and imperial units
- **Help Center**: Comprehensive FAQ system with 12+ topics

### Settings & Support
- **Default Vehicle**: Auto-populate forms with saved vehicle
- **Notifications & Haptics**: Customizable feedback
- **Terms of Service**: Full legal documentation
- **Contact Support**: support@Vyntechs.com

## Project Structure

```
src/
  navigation/
    RootNavigator.tsx           # Main stack navigator with modal support
    MainTabs.tsx                # Bottom tab navigator (Home, History, Tools, Settings)
  screens/
    HomeScreen.tsx              # Main dashboard with intake, AI diagnostics, and community data
    HistoryScreen.tsx           # Past diagnostic sessions
    ToolsScreen.tsx             # VIN decoder, OBD codes, converters
    SettingsScreen.tsx          # App preferences and account settings
    PaywallScreen.tsx           # RevenueCat subscription management
    TermsOfServiceScreen.tsx    # Legal terms and conditions
    HelpCenterScreen.tsx        # FAQ and support documentation
  components/
    AnimatedScanButton.tsx      # 5-step animated scan button with progress
    RepairOutcomeModal.tsx      # Multi-step modal for repair feedback
    WhatFixedItCard.tsx         # Community data display with animations
  state/
    autoSolveStore.ts           # Vehicle data, issue description, and diagnostic results
    subscriptionStore.ts        # RevenueCat subscription and usage tracking
    repairOutcomeStore.ts       # Repair outcomes and follow-up scheduling
    settingsStore.ts            # User preferences
  api/
    diagnostic-service.ts       # GPT-4 diagnostic analysis with Master Tech persona
    openai.ts                   # OpenAI client configuration
    chat-service.ts             # LLM text generation helpers
  types/
    repair-outcome.ts           # Type definitions for repair database
  utils/
    cn.ts                       # Tailwind class merge utility
```

## How "What Fixed It" Works

1. **Diagnosis**: User performs a diagnostic scan with symptoms and DTC codes
2. **Follow-up Scheduling**: System schedules a follow-up check 3 days later
3. **Outcome Collection**: Modal prompts user to share repair outcome
   - Fixed / Partially Fixed / Not Fixed
   - DIY vs Shop repair
   - **Smart Fix Selection**: Dropdown of AI-suggested causes from diagnostic results
   - Option to describe a custom fix if needed
   - Total cost and time spent
   - Confidence rating (1-5 stars)
4. **Data Aggregation**: Submissions are grouped by symptoms + DTC codes
5. **Statistics Display**: Future users see community data showing:
   - Success rate percentage
   - Average cost and time
   - Top 3 most successful solutions
   - Cost distribution breakdown
6. **Network Effects**: More users = better data = more valuable insights

## Design Philosophy

- Apple Human Interface Guidelines compliant
- Light mode with high contrast for shop environments
- Soft whites, pale grays, subtle blue accents
- Rounded cards with soft shadows
- Smooth spring animations and micro-interactions
- Staggered entry animations for visual delight
- Haptic feedback for tactile confirmation
- Clean, professional typography
