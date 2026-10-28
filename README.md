# SmartAttend — University Attendance Platform

A calm, minimalist, zero-backend web application for modern college lecture halls.

## 🚀 Experience the Live Demo

Run locally at: **[http://localhost:3000](http://localhost:3000)**

- **Landing Page**: [`index.html`](file:///home/sapio/Desktop/website%20for%20college/index.html) — High-level editorial overview, interactive hero preview, problem-solving breakdown, and attendance calculator.
- **Classroom Portal**: [`portal.html`](file:///home/sapio/Desktop/website%20for%20college/portal.html) — Full interactive workspace featuring Faculty, Student, and Administration role views with real-time multi-tab sync.

To start the local server at any time:
```bash
python3 -m http.server 3000
```

---

## 🌟 Key Demonstrations

1. **Dual-Tab Live Check-in**:
   - Open `portal.html` in Tab 1 (as **Faculty View**).
   - Open `portal.html` in Tab 2 (as **Student View**).
   - Click "Confirm Attendance" in Tab 2 $\rightarrow$ Watch the student turn **Present** on the Faculty screen in Tab 1 in real-time.
2. **Dynamic 8s QR Passcode**:
   - Regenerates cryptographic nonces every 8 seconds with an animated countdown to render forwarded WhatsApp screenshots obsolete.
3. **Classroom Geofence Check**:
   - Toggle "Simulate Off-Campus" in Student View to show how out-of-classroom check-in attempts are rejected.
4. **Attendance Requirement Calculator**:
   - Calculates allowable absences or required consecutive lectures to retain 75% examination eligibility.
5. **Defaulter Escalation Matrix & CSV Export**:
   - One-click parent notices and instant CSV reports.
