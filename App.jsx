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

// HELPERS
function clean(v) {
  return v ? v.trim() : "";
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function App() {
  const [names, setNames] = useState([]);
  const [comments, setComments] = useState([]);
  const [styleText, setStyleText] = useState("");
  const [styleBank, setStyleBank] = useState(null);

  // ✅ STEP 1: EXTRACT STYLE USING AI
  const analyseStyle = async () => {
    if (!API_KEY || !styleText) return;

    const prompt = `
Analyse the following teacher comments and extract writing patterns.

Return ONLY JSON with:
{
  "openings": [],
  "performance": [],
  "contrast": [],
  "issues": [],
  "improvement": [],
  "encouragement": []
}

Comments:
${styleText}
`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${API_KEY}\`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await res.json();

    try {
      const json = JSON.parse(data.choices[0].message.content);
      setStyleBank(json);
    } catch {
      console.error("Style parse failed");
    }
  };

  // ✅ DEFAULT FALLBACK PHRASES
  const defaultBank = {
    openings: ["^n is a well-rounded learner", "^n is a pleasure to teach"],
    performance: ["^n has shown good progress", "^n has performed well"],
    contrast: ["However", "Although"],
    issues: ["he has struggled with focus", "he has shown inconsistency"],
    improvement: ["Greater focus will help improve performance"],
    encouragement: ["Hou aan hard werk, ^n."]
  };

  // ✅ PHRASE MATRIX USING STYLE BANK
  function generateComment(data) {
    const bank = styleBank || defaultBank;
    const p = data.gender === "female" ? "she" : "he";

    const s1 = \`\${pick(bank.openings)}.\`;
    const s2 = \`\${pick(bank.performance)} in \${data.subject}.\`;
    const s3 = \`\${pick(bank.contrast)}, \${pick(bank.issues)}.\`;
    const s4 = \`\${pick(bank.improvement)}.\`;
    const s5 = \`\${pick(bank.encouragement)}\`;

    return [s1, s2, s3, s4, s5].map(cap).join(" ");
  }

  // ✅ UPLOAD STYLE FILE
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
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const rows = event.target.result.split("\n");

      const newNames = [];
      const newComments = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const [name, gender, subject, traits, behaviour, topics, capabilities, concern] =
          row.split(",").map(clean);

        const comment = generateComment({
          gender,
          subject,
          traits,
          behaviour,
          topics,
          capabilities,
          concern
        });

        newNames.push(name);
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
      "name,gender,subject,traits,behaviour,topics,capabilities,concern\n" +
      "John,male,Mathematics,positive,respectful,algebra,strong reasoning,accuracy";

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
      content += \`
        <tr>
          <td style="padding:8px;"><b>\${names[i]}</b></td>
          <td style="padding:8px;">\${comments[i]}</td>
        </tr>\`;
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
      <h1>Report Comment Generator (Teacher Style AI)</h1>

      <Box>
        <h3>Upload Teacher Comments (Style Learning)</h3>
        <input type="file" accept=".txt" onChange={handleStyleUpload} />
        <Button onClick={analyseStyle}>Analyse Style</Button>
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
