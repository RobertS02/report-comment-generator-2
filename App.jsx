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

// ✅ BASIC CLEAN
function clean(value) {
  return value ? value.trim() : "";
}

// ✅ AI FUNCTION
async function generateWithAI(exampleText, data) {
  const prompt = `
Here are example teacher report comments:
${exampleText}

Write a new comment in the SAME style.

Details:
Subject: ${data.subject}
Traits: ${data.traits}
Behaviour: ${data.behaviour}
Topics: ${data.topics}
Capabilities: ${data.capabilities}
Concern: ${data.concern}

Rules:
- Use natural teacher tone
- Vary sentence structure
- Avoid repetition
- Keep it professional and personalised
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8
    })
  });

  const dataRes = await response.json();
  return dataRes.choices[0].message.content;
}

export default function App() {
  const [names, setNames] = useState([]);
  const [comments, setComments] = useState([]);
  const [aiExamples, setAiExamples] = useState("");

  // ✅ CSV UPLOAD
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
          concern,
          length
        ] = row.split(",").map(v => clean(v));

        newNames.push(name);

        let comment;

        // ✅ USE AI IF PROVIDED
        if (API_KEY && aiExamples.trim()) {
          comment = await generateWithAI(aiExamples, {
            subject,
            traits,
            behaviour,
            topics,
            capabilities,
            concern
          });
        } else {
          comment = `^n is ${traits} and ${behaviour}. He is making progress in ${subject}.`;
        }

        newComments.push(comment);
      }

      setNames(newNames);
      setComments(newComments);
    };

    reader.readAsText(file);
  };

  // ✅ TEMPLATE
  const downloadTemplate = () => {
    const csv =
      "name,gender,subject,traits,behaviour,topics,capabilities,concern,length\n" +
      "John,male,Mathematics,positive and respectful,well-behaved,algebra,strong problem-solving,accuracy,long";

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "template.csv";
    a.click();
  };

  // ✅ WORD EXPORT
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
      <h1>Report Comment Generator (AI Enabled)</h1>

      <Box>
        <h3>Paste Example Comments</h3>
        <textarea
          rows={6}
          style={{ width: "100%" }}
          placeholder="Paste previous report comments here..."
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
