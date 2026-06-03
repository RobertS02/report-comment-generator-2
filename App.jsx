import React, { useState } from "react";

const Box = ({ children }) => (
  <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 10 }}>
    {children}
  </div>
);

const Button = (props) => (
  <button style={{ padding: 8, margin: 5 }} {...props} />
);

const API_KEY = ""; // 🔴 ADD YOUR KEY HERE

const pronouns = { male: "he", female: "she" };

// HELPERS
function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function clean(value) {
  return value ? value.trim() : "";
}

function applyStyleGuide(text) {
  if (!text) return "";
  return text
    .replace(/insightfil/gi, "insightful")
    .replace(/triganomotary/gi, "trigonometry")
    .replace(/learner|pupil|boy|girl/gi, "student")
    .replace(/maths/gi, "Mathematics")
    .replace(/needs /gi, "should ")
    .trim();
}

function formatList(text) {
  if (!text) return "";
  return text.replace(/ and /gi, ", ");
}

// ✅ BASE GENERATOR (UNCHANGED BACKUP)
function baseComment(data) {
  const p = pronouns[data.gender] || "he";
  const P = capitalise(p);

  const traits = formatList(applyStyleGuide(data.traits));
  const behaviour = applyStyleGuide(data.behaviour);
  const capabilities = applyStyleGuide(data.capabilities);
  const topics = applyStyleGuide(data.topics);
  const concern = applyStyleGuide(data.concern);

  let sentences = [];

  if (traits && behaviour) {
    sentences.push(`${P} is ${traits}, ${behaviour}, and approaches classroom tasks positively`);
  }

  if (capabilities) {
    sentences.push(`${P} shows ${capabilities} and is becoming more confident in ${data.subject}`);
  }

  if (topics) {
    sentences.push(`${P} has worked with topics such as ${topics}`);
  }

  sentences.push("This progress is encouraging.");

  if (concern) {
    sentences.push(`${P} should focus on improving ${concern}`);
  }

  return sentences.map(s => capitalise(s) + ".").join(" ");
}

// ✅ ✅ ✅ FINAL AI ENGINE (STYLE PERSONAS ADDED)
async function generateWithAI(exampleText, data) {
  if (!API_KEY || !exampleText.trim()) return "";

  const styles = [
    "Write in a traditional, structured teacher tone.",
    "Write in a conversational and natural teacher style.",
    "Write in an analytical teacher style focusing on performance.",
    "Write in a supportive and encouraging tone."
  ];

  const chosenStyle = styles[Math.floor(Math.random() * styles.length)];

  const prompt = `
You are an experienced teacher writing report comments.

Study the examples below and adopt the same tone and style:
${exampleText}

IMPORTANT:
- Every comment must be written differently
- Do NOT follow a fixed structure
- Vary sentence openings
- Change sentence flow and structure
- Avoid repetition completely
- Make it feel like each comment was written individually

STYLE INSTRUCTION:
${chosenStyle}

Learner details:
Subject: ${data.subject}
Traits: ${data.traits}
Behaviour: ${data.behaviour}
Topics: ${data.topics}
Capabilities: ${data.capabilities}
Area of concern: ${data.concern}

Write a fully natural and unique report comment.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.2
      })
    });

    const result = await response.json();
    return result.choices?.[0]?.message?.content || "";

  } catch (error) {
    console.error("AI error:", error);
    return "";
  }
}

export default function App() {
  const [names, setNames] = useState([]);
  const [comments, setComments] = useState([]);
  const [aiExamples, setAiExamples] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const rows = event.target.result.split("\n");

      const newNames = [];
      const newComments = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const [
          name,
          gender,
          subject,
          traits,
          behaviour,
          topics,
          capabilities,
          concern
        ] = row.split(",").map(v => clean(v));

        let finalComment = "";

        // ✅ AI generation FIRST
        if (API_KEY && aiExamples.trim()) {
          finalComment = await generateWithAI(aiExamples, {
            subject,
            traits,
            behaviour,
            topics,
            capabilities,
            concern
          });
        }

        // ✅ fallback
        if (!finalComment) {
          finalComment = baseComment({
            gender,
            subject,
            traits,
            behaviour,
            topics,
            capabilities,
            concern
          });
        }

        newNames.push(name);
        newComments.push(finalComment);
      }

      setNames(newNames);
      setComments(newComments);
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv =
      "name,gender,subject,traits,behaviour,topics,capabilities,concern\n" +
      "John,male,Mathematics,positive and respectful,well-behaved,algebra,strong reasoning,accuracy";

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "template.csv";
    a.click();
  };

  const exportToWord = () => {
    let content = "<table border='1' style='border-collapse: collapse;'>";

    for (let i = 0; i < comments.length; i++) {
      content += `
        <tr>
          <td style="padding:8px;"><b>${names[i]}</b></td>
          <td style="padding:8px;">${comments[i]}</td>
        </tr>
      `;
    }

    content += "</table>";

    const blob = new Blob([content], { type: "application/msword" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "report-comments.doc";
    a.click();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Report Comment Generator (AI Enhanced)</h1>

      <Box>
        <h3>Paste Example Comments</h3>
        <textarea
          rows={6}
          style={{ width: "100%" }}
          value={aiExamples}
          onChange={(e) => setAiExamples(e.target.value)}
          placeholder="Paste previous comments here..."
        />
      </Box>

      <Box>
        <Button onClick={downloadTemplate}>Download Template</Button>
        <input type="file" accept=".csv" onChange={handleUpload} />
        <Button onClick={exportToWord}>Export to Word</Button>
      </Box>

      <Box>
        <h3>Generated Comments</h3>
        {comments.map((c, i) => (
          <p key={i}>
            <b>{names[i]}</b>: {c}
          </p>
        ))}
      </Box>
    </div>
  );
}
