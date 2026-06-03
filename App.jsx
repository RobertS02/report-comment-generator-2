import React, { useState } from "react";

const Box = ({ children }) => (
  <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 10 }}>
    {children}
  </div>
);

const Button = (props) => (
  <button style={{ padding: 8, marginTop: 6 }} {...props} />
);

const subjects = [
  "Mathematics",
  "English Home Language",
  "Afrikaans First Additional Language"
];

const charLimits = {
  short: 180,
  medium: 300,
  long: 450
};

const openings = [
  "^n demonstrates",
  "^n shows",
  "^n continues to show",
  "^n is developing"
];

const performanceStarters = [
  "has shown",
  "demonstrates",
  "is building",
  "is developing"
];

const topicStarters = [
  "has engaged with topics such as",
  "has worked through topics including",
  "has covered areas such as",
  "has been introduced to concepts such as"
];

const subjectPhrases = {
  Mathematics: [
    "a solid understanding of key concepts",
    "a growing confidence in problem-solving",
    "a good grasp of the work covered"
  ],
  "English Home Language": [
    "confidence in reading and writing",
    "a good understanding of language skills"
  ],
  "Afrikaans First Additional Language": [
    "good progress in language usage",
    "growing confidence in Afrikaans"
  ]
};

const pronouns = {
  male: "he",
  female: "she"
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getReference(step, gender) {
  const p = pronouns[gender] || "they";
  return ["^n", p, p, "^n", p][step % 5];
}

export default function App() {
  const [subject, setSubject] = useState(subjects[0]);
  const [topics, setTopics] = useState("");
  const [traits, setTraits] = useState("");
  const [gender, setGender] = useState("male");
  const [length, setLength] = useState("medium");
  const [comment, setComment] = useState("");

  const generate = () => {
    let text = "";
    let step = 0;
    const limit = charLimits[length];

    const add = (sentence) => {
      if ((text + " " + sentence).trim().length <= limit) {
        text += (text ? " " : "") + sentence;
      }
    };

    add(`${pick(openings)} consistent effort in ${subject}.`);
    add(`${getReference(step++, gender)} ${pick(performanceStarters)} ${pick(subjectPhrases[subject])}.`);

    if (topics) {
      add(`${getReference(step++, gender)} ${pick(topicStarters)} ${topics}.`);
    }

    if (traits) {
      add(`${getReference(step++, gender)} ${traits}.`);
    }

    setComment(text);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Report Comment Generator</h1>

      <Box>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.map((s) => <option key={s}>{s}</option>)}
        </select>

        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <select value={length} onChange={(e) => setLength(e.target.value)}>
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>

        <input placeholder="Topics covered" value={topics} onChange={(e) => setTopics(e.target.value)} />
        <input placeholder="Learner traits" value={traits} onChange={(e) => setTraits(e.target.value)} />

        <Button onClick={generate}>Generate Comment</Button>

        <p>Characters: {comment.length} / {charLimits[length]}</p>
      </Box>

      <Box>
        <p>{comment}</p>
      </Box>
    </div>
  );
}
