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

// ✅ ✅ STRONG BASE ENGINE (RESTORED)
function baseComment(data) {
  const p = pronouns[data.gender] || "he";

  let sentences = [];

  if (data.traits && data.behaviour) {
    sentences.push(`^n is ${data.traits}, ${data.behaviour}, and approaches classroom tasks with a positive attitude`);
  }

  if (data.capabilities) {
    sentences.push(`${p} shows ${data.capabilities} in ${data.subject} and is becoming more confident`);
  }

  if (data.topics) {
    sentences.push(`${p} has worked with topics such as ${data.topics} and is developing a stronger understanding`);
  }

  sentences.push("This progress is encouraging.");

  if (data.concern) {
    sentences.push(`${p} should focus on improving ${data.concern} to strengthen overall performance`);
  }

  return sentences
    .map(s => capitalise(s) + ".")
    .join(" ");
}

// ✅ ✅ AI REWRITER (CORRECT ROLE)
async function refineWithAI(styleText, baseText) {
  if (!API_KEY || !styleText.trim()) return baseText;

  const prompt = `
You are an experienced teacher.

Below are example report comments that define your writing style:
${styleText}

Now rewrite the following report comment.

IMPORTANT RULES:
- Keep the meaning exactly the same
- KEEP the use of ^n
- Do NOT follow the same sentence structure
- Change how sentences begin
- Vary sentence flow
- Avoid repetitive phrasing
- Make it sound natural and human-written

Base comment:
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
        temperature: 1.1
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || baseText;

  } catch (err) {
    console.error(err);
    return baseText;
  }
}

export default function App() {
  const [names, setNames] = useState([]);
  const [comments, setComments] = useState([]);
  const [styleText, setStyleText] = useState("");

  // ✅ STYLE FILE
  const handleStyleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setStyleText(event.target.result);
    };

    reader.readAsText(file);
  };

  // ✅ CSV
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

        // ✅ STEP 1: strong base
        const base = baseComment({
          gender, subject, traits, behaviour, topics, capabilities, concern
        });

        // ✅ STEP 2: AI rewrite
        const final = await refineWithAI(styleText, base);

        newNames.push(name);
        newComments.push(final);
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
      <h1>Report Comment Generator (Hybrid AI)</h1>

      <Box>
        <h3>Upload Style Document</h3>
        <input type="file" accept=".txt" onChange={handleStyleUpload} />
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
