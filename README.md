# 🤖 AI Notes Generator

An AI-powered study assistant that converts lectures, PDFs, text, and transcripts into clear, organized study notes in seconds.

## 📌 Overview

Students often spend a lot of time creating notes from lengthy lectures and study materials.

**AI Notes Generator** uses Artificial Intelligence to automatically transform learning materials into useful study resources such as:

* 📝 Structured notes
* 📌 Important points
* 📖 Definitions
* ❓ Questions and answers
* 🧠 Flashcards
* 📝 Practice quizzes
* 📚 Short summaries

The goal is simple:

> **Turn any lecture or study material into complete study material in seconds.**

## ✨ Features

### 📄 Multiple Input Types

Users can provide:

* Text
* Lecture transcripts
* PDF documents
* Audio/lecture recordings

### 🤖 AI Note Generation

The system analyzes the provided content and generates:

* Topic-wise notes
* Key concepts
* Important facts
* Definitions
* Examples
* Summary

### 🧠 Flashcards

Automatically generates question-and-answer flashcards to help students revise important concepts.

### ❓ Quiz Generation

Creates practice questions from the uploaded learning material.

### 🔍 Search Notes

Users can quickly search through their generated notes.

### ✏️ Edit Notes

Generated notes can be edited and customized by the user.

### 📋 Copy & Print

Users can copy notes or print them for offline study.

## 🛠️ Technology Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### AI

* Google Gemini API

### Validation

* Zod

### Deployment

* Render

### Version Control

* Git
* GitHub

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   + Tailwind CSS    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │      Backend        │
                    └──────┬───────┬──────┘
                           │       │
                ┌──────────┘       └──────────┐
                ▼                             ▼
       ┌────────────────┐            ┌────────────────┐
       │ Google Gemini  │            │  PostgreSQL    │
       │      AI        │            │    Database    │
       └────────────────┘            └────────────────┘
```

## 🔄 How It Works

```text
1. User uploads or enters learning material
                ↓
2. Backend receives the content
                ↓
3. Content is processed
                ↓
4. Gemini AI analyzes the material
                ↓
5. AI generates structured notes
                ↓
6. Notes, flashcards and quizzes are created
                ↓
7. Results are saved in PostgreSQL
                ↓
8. User views and studies the generated content
```

## 📂 Project Structure

```text
ai-notes-generator/
│
├── client/
│   ├── src/
│   ├── public/
│   └── ...
│
├── server/
│   ├── routes/
│   ├── services/
│   ├── db/
│   └── index.ts
│
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
└── .env
```

## 🔐 Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgresql_database_url
SESSION_SECRET=your_secret_key
NODE_ENV=development
PORT=5000
```

⚠️ **Never upload your `.env` file to GitHub.**

Make sure `.gitignore` contains:

```text
node_modules/
.env
dist/
*.log
```

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/padalalaasya98-afk/ai-notes-generator.git
```

### 2. Enter the project

```bash
cd ai-notes-generator
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create `.env` and add your API keys and database URL.

### 5. Start the application

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5000
```

## ☁️ Deployment

The application can be deployed using **Render**.

Recommended architecture:

```text
GitHub
   ↓
Render Web Service
   ↓
Node.js + Express
   ↓
React Frontend
   ↓
PostgreSQL + Gemini API
```

### Render Build Command

```bash
npm install && npm run build
```

### Render Start Command

```bash
npm start
```

Add the required environment variables in the Render dashboard.

## 🎯 Target Users

* College students
* School students
* Online learners
* Competitive exam students
* Teachers
* Self-learners

## 💡 Use Cases

### College Student

Upload a lengthy lecture transcript and generate structured revision notes.

### Competitive Exam Student

Convert study material into summaries, flashcards and quizzes.

### Online Learner

Turn recorded lecture content into easy-to-revise notes.

### Teacher

Generate quizzes and study materials from lesson content.

## 🌟 Future Improvements

* Voice-to-text transcription
* Multi-language note generation
* AI chat with notes
* Personalized study plans
* Automatic difficulty adjustment
* Spaced-repetition flashcards
* Progress tracking
* Mobile application
* Offline AI support

## 🔒 Privacy

The application is designed to keep user data protected.

* API keys are stored as environment variables.
* Sensitive credentials are never committed to GitHub.
* User data is isolated between accounts.
* AI requests are handled through the backend.

## 🏆 Hackathon Project

**Project:** AI Notes Generator

**Category:** AI / EdTech

**Goal:** Make studying faster by automatically converting lectures and learning materials into organized study resources.

### One-Line Pitch

> **Turn any lecture into complete study material in seconds.**

## 📄 License

This project is created for educational and hackathon purposes.
