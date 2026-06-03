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

// ✅ YOUR ADVANCED BASE COMMENT ENGINE (KEEP THIS!)
function baseComment(data) {
  const p = pronouns[data.gender] || "he";
  const P = capitalise(p);

  const traits = data.traits;
  const behaviour = data.behaviour;
  const capabilities = data.capabilities;
  const topics = data.topics;
  const concern = data.concern;

  let sentences = [];

  if (traits && behaviour) {
    sentences.push(`^n is ${traits}, ${behaviour}, and approaches classroom tasks with a positive attitude`);
  }

  if (capabilities) {
    sentences.push(`${P} shows ${capabilities} and is becoming more confident in ${data.subject}`);
  }

  if (topics) {
    sentences.push(`${P} has worked with topics such as ${topics} and applies this knowledge in class`);
  }

  sentences.push("This progress is encouraging.");

  if (concern) {
    sentences.push(`${P} should focus on improving ${concern} to strengthen overall performance`);
  }

  return sentences.map(s => capitalise(s) + ".").join(" ");
}

// ✅ AI REFINEMENT LAYER (NEW)
async function refineWithAI(exampleText, baseText) {
  if (!API_KEY || !exampleText.trim()) return baseText;

  const prompt = `
You are an experienced teacher writing report comments.

Here are examples of your writing style:
${exampleText}

Now rewrite the following comment so that it:
- Matches the tone and style of the examples
- Sounds natural and personalised
- Uses varied sentence structure
- Avoids repetition
- Keeps the meaning

Comment:
${baseText}
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
        temperature: 0.9
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || baseText;

  } catch (error) {
    console.error("AI Error:", error);
    return baseText; // fallback ✅
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

        // ✅ STEP 1: Generate base comment
        const base = baseComment({
          gender,
          subject,
          traits,
          behaviour,
          topics,
          capabilities,
          concern
        });

        // ✅ STEP 2: AI refines it
        const finalComment = await refineWithAI(aiExamples, base);

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
