import React, { useState } from "react";

const Box = ({ children }) => (
  <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 10 }}>
    {children}
  </div>
);

const Button = (props) => (
  <button style={{ padding: 8, margin: 5 }} {...props} />
);

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

// ✅ ✅ ✅ PHRASE MATRIX ENGINE
function generateComment(data) {
  const p = data.gender === "female" ? "she" : "he";

  // ✅ SLOT 1: TRAITS + BEHAVIOUR
  const openings = [
    "^n is a pleasure to teach",
    "^n is a well-rounded learner",
    "^n is a quiet and reserved student",
    "^n is a hardworking and dedicated learner",
    "^n is an enthusiastic and engaged student"
  ];

  const behaviourPhrases = [
    "with very good manners",
    "who contributes positively in class",
    "who applies himself consistently",
    "who shows a positive attitude towards learning",
    "who engages well with class work"
  ];

  // ✅ SLOT 2: PERFORMANCE
  const performanceStarters = [
    "^n has shown strong ability",
    "^n has performed well",
    "^n has demonstrated good understanding",
    "^n has achieved pleasing results",
    "^n has shown promising progress"
  ];

  const performanceEndings = [
    `in ${data.subject}`,
    `throughout the term`,
    `in recent assessments`,
    `during this semester`,
    `in class tasks`
  ];

  // ✅ SLOT 3: CONTRAST
  const contrasts = [
    "However",
    "Although",
    "There have been moments where",
    "At times",
    "More recently"
  ];

  const issues = [
    `${p} has struggled with ${data.concern}`,
    `${p} has shown some inconsistency`,
    `${p} has lost focus in certain assessments`,
    `${p} has found some difficulty in key areas`,
    `${p} needs to improve focus and consistency`
  ];

  // ✅ SLOT 4: DEVELOPMENT
  const improvement = [
    `Greater focus on ${data.concern} will help ${p} improve`,
    `Some attention to ${data.concern} will support further progress`,
    `Working on ${data.concern} will allow ${p} to achieve stronger results`,
    `Improving ${data.concern} will greatly benefit overall performance`,
    `Continued effort in ${data.concern} will lead to improvement`
  ];

  // ✅ SLOT 5: ENCOURAGEMENT
  const encouragement = [
    "Hou aan met die harde werk, ^n.",
    "Baie mooi, ^n.",
    "Ek is trots op jou.",
    "Hou so aan, ^n.",
    "Jy kan dit doen, ^n."
  ];

  // ✅ BUILD COMMENT
  const sentence1 = `${pick(openings)} ${pick(behaviourPhrases)}.`;
  const sentence2 = `${pick(performanceStarters)} ${pick(performanceEndings)}.`;
  const sentence3 = `${pick(contrasts)}, ${pick(issues)}.`;
  const sentence4 = `${pick(improvement)}.`;
  const sentence5 = `${pick(encouragement)}`;

  return [sentence1, sentence2, sentence3, sentence4, sentence5]
    .map(cap)
    .join(" ");
}

export default function App() {
  const [names, setNames] = useState([]);
  const [comments, setComments] = useState([]);

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

        const [
          name,
          gender,
          subject,
          traits,
          behaviour,
          topics,
          capabilities,
          concern
        ] = row.split(",").map(clean);

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
      <h1>Report Comment Generator (Phrase Matrix)</h1>

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
