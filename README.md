# 📚 StudyAI Backend

This is the backend server for **StudyAI** — a personal AI study companion that analyzes uploaded study notes and provides:

- Summaries  
- Flashcards  
- Multiple-choice quizzes  
- A chat-based question-answering interface

---

## 🚀 Features

- Accepts `.txt` or `.pdf` file uploads
- Sends notes to an AI model via Together API
- Returns:
  - A concise summary
  - A set of flashcards
  - Quiz questions with answer choices
- Chat endpoint to ask follow-up questions about the document

---

## 📦 Requirements

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn
- API key for [Together AI](https://platform.together.xyz/)

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/studyai-backend.git
cd studyai-backend
```

### 2. Install Dependencies

```bash
git clone https://github.com/your-username/studyai-backend.git
cd studyai-backend
```

### 3. Configure environment variables

Create a .env file in the project root and add your Together API key:
```bash
TOGETHER_API_KEY=your_together_api_key_here
```

### 🧪 Running the Server

Create a .env file in the project root and add your Together API key:
```bash
node app.js
```
