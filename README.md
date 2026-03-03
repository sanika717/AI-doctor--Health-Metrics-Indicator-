# 🏥 AI Health Scanner v2

## New Features in v2
- 🕸️ Real-time Face Mesh (26 landmarks on live camera)
- 📊 Health History Dashboard with trend charts
- 👤 User Login & Profile
- 🌐 Multi-language: English, Hindi, Marathi, Tamil
- 🏥 Smart Doctor Recommendations after scan

---

## Run Instructions (macOS + VSCode)

### Prerequisites
- Python 3.11 → `brew install python@3.11`
- Node.js 18+ → https://nodejs.org
- MongoDB → `brew tap mongodb/brew && brew install mongodb-community`

---

### Terminal 1 — MongoDB
```bash
brew services start mongodb-community
```

### Terminal 2 — Backend
```bash
cd ai-health-scanner
chmod +x start_backend.sh
./start_backend.sh
```
✅ Should show: `Uvicorn running on http://0.0.0.0:8000`

### Terminal 3 — Frontend
```bash
cd ai-health-scanner
chmod +x start_frontend.sh
./start_frontend.sh
```
✅ Should show: `Compiled successfully! Local: http://localhost:3000`

---

## If backend fails with Python version error

```bash
cd ai-health-scanner/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Open in browser
http://localhost:3000
