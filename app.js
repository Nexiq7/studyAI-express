const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = 3001;

app.use(cors());
app.use(express.json());

let lastDocumentText = '';

app.post('/api/analyze', upload.single('file'), async (req, res) => {
     try {
          const filePath = req.file.path;
          const fileText = fs.readFileSync(filePath, 'utf8');
          fs.unlinkSync(filePath);

          lastDocumentText = fileText;

          const systemPrompt = `You are StudyAI, an AI that always replies with pure JSON.
Do NOT explain anything. Do NOT include markdown, code blocks, or anything outside the JSON. Use English only.

Given study notes, return this format:
{
  "summary": "...",
  "flashcards": [
    { "front": "...", "back": "..." }
  ],
  "quiz": [
    { "question": "...", "options": ["A", "B", "C", "D"], "answer": "B" }
  ]
}

Return only valid JSON.`;

          const response = await axios.post(
               'https://api.together.xyz/v1/chat/completions',
               {
                    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                    messages: [
                         { role: 'system', content: systemPrompt },
                         { role: 'user', content: fileText }
                    ],
                    max_tokens: 1200,
                    temperature: 0.7,
               },
               {
                    headers: {
                         Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
                         'Content-Type': 'application/json'
                    }
               }
          );

          const aiContent = response.data.choices[0].message.content;
          console.log("Raw AI Response:\n", aiContent);

          const jsonMatch = aiContent.match(/{[\s\S]*}/);
          if (!jsonMatch) {
               return res.status(500).json({
                    error: 'No JSON found in AI output.',
                    raw: aiContent
               });
          }

          try {
               const result = JSON.parse(jsonMatch[0]);
               res.json(result);
          } catch (parseError) {
               res.status(500).json({
                    error: 'Failed to parse JSON from AI.',
                    raw: jsonMatch[0]
               });
          }
     } catch (err) {
          console.error('Server error:', err.message);
          res.status(500).json({ error: 'Server error', details: err.message });
     }
});

app.post('/api/chat', async (req, res) => {
     try {
          const { question } = req.body;
          if (!question) return res.status(400).json({ error: 'No question provided' });

          if (!lastDocumentText) {
               return res.status(400).json({ error: 'No document analyzed yet. Please upload a document first.' });
          }

          const systemPrompt = `You are StudyAI, an AI study assistant that answers questions strictly based on the provided study notes.
Do NOT invent answers. Use English only. Reply with concise, helpful answers without extra explanations.`;

          const userPrompt = `
Study notes:
"""
${lastDocumentText}
"""

User question:
${question}
`;

          const response = await axios.post(
               'https://api.together.xyz/v1/chat/completions',
               {
                    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                    messages: [
                         { role: 'system', content: systemPrompt },
                         { role: 'user', content: userPrompt }
                    ],
                    max_tokens: 600,
                    temperature: 0.6,
               },
               {
                    headers: {
                         Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
                         'Content-Type': 'application/json'
                    }
               }
          );

          const answer = response.data.choices[0].message.content;
          res.json({ answer });
     } catch (err) {
          console.error('Server error (chat):', err.message);
          res.status(500).json({ error: 'Server error', details: err.message });
     }
});

app.listen(port, () => {
     console.log(`✅ StudyAI backend running at http://localhost:${port}`);
});
