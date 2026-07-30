# 🤟 SignVerse – Real-Time Indian Sign Language Interpreter

An AI-powered **Indian Sign Language (ISL) Interpreter** that recognizes hand gestures in real time using **MediaPipe** and a **Random Forest Machine Learning model**, translates recognized signs into multiple Indian languages, and converts the output into natural speech using **ElevenLabs AI** with an automatic browser speech fallback.

---

## ✨ Features

- 🤟 Real-time Indian Sign Language recognition
- ✋ MediaPipe 21-point hand landmark detection
- 🧠 Random Forest ML classifier
- 🌍 Multi-language translation
  - English
  - Hindi
  - Bengali
  - Urdu
- 🔊 ElevenLabs AI Text-to-Speech
- 🎤 Automatic browser speech fallback
- ⚡ Modern React + Tailwind UI
- 📱 Responsive Design

---

# 🏗️ System Architecture

```text
                    ┌────────────────────┐
                    │      Webcam        │
                    └─────────┬──────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │   MediaPipe Hand Model  │
                │ (21 Landmark Detection) │
                └─────────┬───────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │ Feature Extraction Layer │
              └─────────┬────────────────┘
                        │
                        ▼
          ┌──────────────────────────────┐
          │ Random Forest ML Classifier  │
          └─────────┬────────────────────┘
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
 Recognized Text          Translation Service
        │                        │
        └───────────┬────────────┘
                    ▼
           ElevenLabs AI TTS
                    │
                    ▼
              Voice Output
```

---

# 📂 Project Structure

```text
signVerse/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── app.js
│   │
│   ├── package.json
│   └── .env.example
│
├── ml-service/
│   ├── app.py
│   ├── model.p
│   ├── requirements.txt
│   └── utils/
│
└── README.md
```

---

# 🛠 Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- JavaScript

### Backend

- Node.js
- Express.js
- REST API

### Machine Learning

- Python 3.11
- MediaPipe
- OpenCV
- NumPy
- Scikit-Learn
- Random Forest Classifier

### AI Services

- ElevenLabs Text-to-Speech
- Web Speech API (Fallback)

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/yourusername/signverse.git

cd signverse
```

---

# Install Frontend

```bash
cd frontend

npm install

npm run dev
```

Runs on

```
http://localhost:5173
```

---

# Install Backend

```bash
cd backend

npm install

npm run dev
```

Runs on

```
http://localhost:5000
```

---

# Install ML Service

```bash
cd ml-service

py -3.11 -m venv venv

venv\Scripts\activate

python -m pip install --upgrade pip

pip install -r requirements.txt

python app.py
```

Runs on

```
http://localhost:5001
```

---

# Environment Variables

## Backend (.env)

```env
PORT=5000
ML_SERVICE_URL=http://localhost:5001
ELEVENLABS_API_KEY=YOUR_ELEVENLABS_API_KEY
```

## Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
VITE_ML_URL=http://localhost:5001
```

---

# Application Workflow

```text
User Opens Website
        │
        ▼
Allow Camera Permission
        │
        ▼
MediaPipe Detects Hand Landmarks
        │
        ▼
Random Forest Predicts Sign
        │
        ▼
Recognized Text Displayed
        │
        ├────────► Translate
        │
        └────────► ElevenLabs Voice
```

---

# API Endpoints

## Recognition

```
POST /api/recognize
```

## Translation

```
POST /api/translate
```

## Text To Speech

```
POST /api/tts
```

---

# Deployment

## Frontend

Deploy on:

- Vercel
- Netlify

Build command:

```bash
npm run build
```

Output directory:

```
dist
```

---

## Backend

Deploy on:

- Render
- Railway

Start command:

```bash
npm start
```

---

## ML Service

Deploy on:

- Render
- Railway

Start command:

```bash
python app.py
```

---

# Future Improvements

- More Indian Sign Language gestures
- Continuous sentence recognition
- Sentence prediction using AI
- User authentication
- Gesture history
- Model retraining dashboard
- Mobile application
- Offline inference support

---

# Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature-name
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push your branch.

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

# License

This project is licensed under the **MIT License**.

---

# Acknowledgements

- Google MediaPipe
- ElevenLabs
- React
- Vite
- Tailwind CSS
- Express.js
- OpenCV
- Scikit-Learn
- NumPy

---

## ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub. It helps others discover the project and supports future development.