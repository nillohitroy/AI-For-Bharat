# Raksha AI - AI For Bharat Hackathon

[![Hackathon](https://img.shields.io/badge/Hackathon-AI%20For%20Bharat-orange.svg)](https://github.com/nillohitroy/AI-For-Bharat)
[![Flutter](https://img.shields.io/badge/Mobile-Flutter-blue.svg)](https://flutter.dev/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)

> Empowering vulnerable digital users against localized social engineering and financial fraud through AI-driven interception, a peer-to-peer Guardian Network, and adaptive digital literacy.

---

## Table of Contents
- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [System Architecture & Process Flow](#system-architecture--process-flow)
- [Technologies Utilized](#technologies-utilized)
- [Prototype Performance & Benchmarking](#prototype-performance--benchmarking)
- [Estimated Implementation Cost](#estimated-implementation-cost)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup (FastAPI)](#1-backend-setup-fastapi)
  - [2. Frontend Setup (Next.js)](#2-frontend-setup-nextjs)
  - [3. Mobile App Setup (Flutter)](#3-mobile-app-setup-flutter)
- [Run via APK (Quickest Method)](#run-via-apk-quickest-method)
- [Future Development](#future-development)

---

## About the Project
**Raksha AI** is a comprehensive defense ecosystem designed to protect non-technical users from sophisticated, culturally contextual scams (like fake festival offers, urgent family emergency frauds, and UPI-specific social engineering). 

When a suspicious SMS is received, the Raksha Android app intercepts it, our DeepSeek-powered FastAPI backend analyzes the semantic intent, and if the AI is unsure, the threat is routed to a trusted family member (Guardian) via a Next.js web portal for human verification. Every blocked threat is converted into a gamified micro-lesson to improve the user's digital literacy.

## Key Features
* **Real-Time Threat Interception:** Background SMS monitoring to catch scams before the user clicks.
* **Deep Context AI Analysis:** Powered by DeepSeek LLM to understand multilingual, culturally specific fraud narratives.
* **Guardian Network (Human-in-the-loop):** Suspicious payloads are sent to a Next.js dashboard where tech-savvy peers can verify and block threats remotely.
* **Adaptive Digital Literacy:** Gamified, voice-first micro-lessons generated dynamically based on the specific threats the user encounters.

---

## System Architecture & Process Flow

**The Simplified Process Flow**
1. **SMS Arrives:** The vulnerable user receives an SMS (e.g., a localized festival lottery link).
2. **App Intercepts:** The Raksha Android app instantly intercepts the message in the background.
3. **DeepSeek Evaluation:** The backend queries the DeepSeek model to analyze the cultural context and semantic intent.
4. **The Decision Branch:**
   * **SAFE:** The message is released to the user normally.
   * **MALICIOUS (High Confidence):** The app instantly blocks the scam and alerts the user.
   * **SUSPICIOUS (Low Confidence):** The app flags the message and pauses it for human review on the Guardian Portal.
5. **Peer Review:** A trusted "Guardian" reviews the threat and clicks either [Block] or [Allow].
6. **Adaptive Literacy:** If a threat was blocked, the app generates a quick, 1-minute interactive quiz in the user's native language explaining why it was a scam.
---

## Technologies Utilized

### 1. Artificial Intelligence & Cognitive Layer
* **AWS Bedrock & DeepSeek AI (LLM):** The core cognitive engine of the platform. Utilized to perform deep semantic analysis on intercepted messages, decode localized cultural context, and dynamically generate gamified digital literacy micro-lessons.

### 2. Frontend Ecosystem (User Interfaces)
* **Flutter (Dart):** Powers the mobile application for the vulnerable end-user. It compiles natively to Android, running background interception services and delivering smooth, voice-first educational modules.
* **Next.js & Tailwind CSS:** Powers the Guardian Web Portal. Chosen for fast rendering and a modular component architecture, allowing tech-savvy Guardians to monitor real-time threat feeds.

### 3. Backend Engine & Database
* **FastAPI (Python):** High-performance backend framework routing requests between the mobile app, AI services, and the database using native asynchronous support.
* **Supabase (PostgreSQL):** Acts as the unified relational database. Securely stores user profiles, Guardian network peer mappings, and handles real-time state syncing.

### 4. Cloud Infrastructure
* **AWS Amplify:** Fully managed deployment for the Next.js Guardian Portal ensuring seamless CI/CD.
* **AWS EC2:** Scalable cloud compute instance hosting the FastAPI backend, handling concurrent background requests without dropping connections.

---

## Prototype Performance & Benchmarking

* **Threat Interception Latency:** * **Result:** ~1.8 Seconds Average Round-Trip Time.
 
* **Contextual AI Accuracy:**
  * **Result:** 90% True Positive Rate on localized social engineering test sets.
  * **Details:** Successfully identified nuanced threats (e.g., Hindi festival scams) that traditional keyword-blockers miss.
* **Guardian Network Sync Speed:**
  * **Result:** < 1 Second Database Sync.
  * **Details:** Supabase real-time subscriptions ensure that when a Guardian clicks "Block", the user's Flutter app updates instantly.
* **Mobile Resource Efficiency:**
  * **Result:** Minimal Background Drain.
  * **Details:** Cognitive lifting is offloaded to the AWS/FastAPI backend, keeping the Flutter app lightweight for lower-end Android devices.

---

## Estimated Implementation Cost

**Phase 1: Prototype & Beta Testing (Current)**
*Total Estimated Monthly Cost: $0 - $15 / month*
* **AWS EC2:** ~$0 (AWS Free Tier - t2/t3.micro).
* **AWS Amplify:** ~$0 (Free tier covers 1,000 build minutes and 15GB hosting bandwidth).
* **Supabase:** $0 (Free tier covers up to 500MB DB space and 2GB bandwidth).
* **DeepSeek / Bedrock API:** ~$5 - $15 (Pay-per-token based on short-form SMS text analysis).

**Phase 2: Early Production Scaling (Targeting 10,000+ Users)**
*Total Estimated Monthly Cost: $150 - $300 / month*
* **AWS EC2:** ~$40 - $80 (Load-balanced t3.medium instances).
* **AWS Amplify:** ~$10 - $20 (Scaled bandwidth).
* **Supabase:** $25 (Pro Tier).
* **AI Inference:** ~$75 - $175 (Highly cost-effective due to small token payloads).

---

## Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites
* [Python 3.12+](https://www.python.org/downloads/)
* [Node.js 22+](https://nodejs.org/)
* [Flutter SDK](https://docs.flutter.dev/get-started/install)
* Git

### 1. Backend Setup (FastAPI)

Open your terminal and run the following commands to set up the Python environment, install dependencies, and start the API server:

```bash
# Clone the repository and navigate to the backend directory
git clone https://github.com/nillohitroy/AI-For-Bharat.git
cd AI-For-Bharat/raksha-backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install all required Python dependencies
pip install -r requirements.txt

# Create an environment file for your API keys
echo "SUPABASE_URL=your_supabase_url" > .env
echo "SUPABASE_SECRET_KEY=your_supabase_secret_key" >> .env
echo "AWS_ACCESS_KEY_ID=your_aws_access_key" >> .env
echo "AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key" > .env
echo "AWS_REGION=your_aws_region" >> .env
echo "BEDROCK_MODEL_ID=your_bedrock_model_id" >> .env

# Run the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **2\. Frontend Setup (Next.js)**

Open a new terminal window and run the following commands to install Node packages and start the Guardian dashboard:

```bash
# Navigate to the frontend directory  
cd AI-For-Bharat/raksha-dashboard

# Install all required Node.js dependencies  
npm install

# Create an environment file for your frontend keys  
echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" > .env.local  
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env.local  
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local

# Run the development server  
npm run dev
```

### **3\. Mobile App Setup (Flutter)**

Open a new terminal window and run the following commands to fetch Flutter packages and launch the mobile application:

```

# Navigate to the flutter app directory  
cd AI-For-Bharat/app

# Get all required Flutter packages  
flutter pub get

# (Ensure you have an Android Emulator running or a physical device connected via USB debugging)

# Run the app  
flutter run
```

##

**Run via APK (Quickest Method)**

If you are a hackathon judge or tester and want to skip the mobile build process, you can directly install the compiled Android APK.

1. Go to the **raksha-mobile** directory of this repository.  
2. Download the app-release.apk file.  
3. Transfer the APK to your Android device.  
4. Open the file to install (Ensure "Install from Unknown Sources" is enabled in your device settings and Google Play Protect is disabled in your Google Playstore).  
5. Launch the **Raksha AI** app\!

##

**Future Development**

* **Multi-Agent Threat Resolution:** Transitioning to a decentralized Multi-Agent System using agentic AI frameworks to deploy specialized micro-agents (e.g., URL sanitization agents, linguistic parsing agents).  
* **Hardware-Optimized Backend Inference:** Scaling the FastAPI EC2 architecture to run on high-performance compute instances to maximize the cost-to-performance ratio for neural ingestion.  
* **Automated Threat Intelligence Pipelines:** Applying data cleaning and feature engineering to blocked payloads to build real-time heat maps of social engineering trends for telecommunications providers.  
* **Expansion to Encrypted Platforms:** Building accessibility-layer integrations capable of analyzing suspicious payloads on encrypted platforms like WhatsApp entirely on-device.