# Voice Commands Reference

Atlas Dashboard supports voice control using ElevenLabs integration. Click the microphone button in the navigation bar to activate voice control.

## Navigation Commands

### Show Overview
- "Show me the overview"
- "Go to dashboard"
- "Navigate to home"
- "Take me home"

**Action:** Navigates to the main dashboard page

### Show Analytics
- "Show analytics"
- "Go to analytics"
- "Navigate to analytics page"

**Action:** Navigates to the analytics page

### Show Logs
- "Show logs"
- "Open logs"
- "Go to logs"
- "Show me the log viewer"

**Action:** Navigates to the logs page

### Show Database
- "Show database"
- "Go to database"
- "Show storage"
- "Navigate to database monitoring"

**Action:** Navigates to the database monitoring page

---

## Query Commands

### System Health
- "What's the system health?"
- "How is the system doing?"
- "Show me system status"
- "What's the health status?"

**Response:** Provides current system health status, active projects, request count, and error count

### Error Count
- "What's the error rate?"
- "How many errors are there?"
- "Show me errors"
- "Are there any errors?"

**Response:** Reports current error count across all projects

### Project Count
- "How many projects are active?"
- "Show me projects"
- "How many projects do I have?"

**Response:** Reports the number of active monitored projects

---

## Action Commands

### Refresh Data
- "Refresh data"
- "Reload the dashboard"
- "Update data"
- "Refresh the page"

**Action:** Clears cache and fetches fresh data from all sources

### Deploy Project
- "Deploy atlas-dashboard"
- "Deploy [project-name]"

**Action:** Initiates deployment workflow for specified project (requires confirmation)

---

## Tips for Best Results

1. **Speak Clearly:** Pronounce commands clearly for best recognition
2. **Wait for Response:** Allow Flo to finish responding before issuing another command
3. **Use Natural Language:** Commands are parsed intelligently - you don't need exact phrases
4. **Check Microphone:** Ensure your microphone is working and permissions are granted

---

## Voice Response Features

- **Audio Feedback:** Flo speaks responses using ElevenLabs TTS
- **Visual Indicators:** Listening state shown with pulsing rings around Flo avatar
- **Command History:** Recent voice commands are displayed in the interface
- **Error Handling:** If a command isn't understood, Flo will ask for clarification

---

## Future Commands (Coming Soon)

- "Show logs for [project-name]"
- "What was the uptime last week?"
- "Create a new project"
- "Set up alerts for high error rates"
- "Export analytics data"

---

## Troubleshooting

### Voice Not Working
1. Check microphone permissions in browser
2. Ensure ELEVENLABS_API_KEY is configured
3. Check browser console for errors

### Commands Not Recognized
1. Speak more slowly and clearly
2. Use simpler phrasing
3. Check that microphone is picking up audio

### No Audio Response
1. Check browser audio permissions
2. Ensure speakers/headphones are connected
3. Verify ElevenLabs API key is valid

---

For technical details, see `lib/voice/elevenlabs.ts`
