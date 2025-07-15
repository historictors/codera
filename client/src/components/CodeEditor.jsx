import { useState } from "react";
import axios from "axios";
import EditorLib from "@monaco-editor/react";

const languageMap = {
  cpp: 54,
  python: 71,
  java: 62,
  javascript: 63,
};

const Editor = ({ initialInput = "", defaultLanguage = "cpp" }) => {
  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState(defaultLanguage);
  const [loading, setLoading] = useState(false);
  const boilerplates = {
  cpp: `#include <iostream>
using namespace std;

int main() {
  // your code here
  return 0;
}`,
  python: `# your code here
print("Hello, World!")`,
  java: `public class Main {
  public static void main(String[] args) {
    // your code here
  }
}`,
  javascript: `// your code here
console.log("Hello, World!");`,
};


  const [testCases, setTestCases] = useState([
    { input: "", expected: "", output: "", status: "" },
  ]);

  const addTestCase = () => {
    setTestCases([
      ...testCases,
      { input: "", expected: "", output: "", status: "" },
    ]);
  };

  const removeTestCase = (index) => {
    if (testCases.length === 1) return;
    const updated = testCases.filter((_, i) => i !== index);
    setTestCases(updated);
  };

  const handleRun = async () => {
    setLoading(true);

    const updatedTestCases = await Promise.all(
      testCases.map(async (testCase) => {
        try {
          const response = await axios.post(
            "https://judge0-ce.p.rapidapi.com/submissions",
            {
              source_code: code,
              stdin: testCase.input,
              language_id: languageMap[language],
            },
            {
              params: {
                base64_encoded: "false",
                wait: "true",
              },
              headers: {
                "content-type": "application/json",
                "X-RapidAPI-Key": "054fef72aemsh74c70880308d543p110f8cjsn03350a791e05", // Replace with your own key
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
              },
            }
          );

          const result =
            response.data.stdout?.trim() ||
            response.data.stderr ||
            response.data.compile_output ||
            "No Output";
          const passed = result === testCase.expected.trim();

          return {
            ...testCase,
            output: result,
            status: passed ? "✅ Passed" : "❌ Failed",
          };
        } catch (err) {
          return {
            ...testCase,
            output: "Error: " + err.message,
            status: "❌ Error",
          };
        }
      })
    );

    setTestCases(updatedTestCases);
    setLoading(false);
  };

  return (
    <div className="p-6">
      Language & Run Button
      <div className="mb-4 flex gap-4">
        <select
          value={language}
           onChange={(e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(boilerplates[lang]); 
  }}
        >
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="javascript">JavaScript</option>
        </select>
        <button
          onClick={handleRun}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Running..." : "Run All Tests"}
        </button>
      </div>

      {/* Code Editor */}
      <EditorLib
        height="300px"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
      />

      {/* Test Cases Section */}
      <h3 className="font-bold mt-6 text-xl">🧪 Test Cases</h3>
      {testCases.map((tc, i) => (
        <div
          key={i}
          className="border p-4 rounded mt-4 bg-gray-100 shadow-sm relative"
        >
          <p className="font-semibold text-lg">
            Test Case {i + 1}
            <button
              className="text-red-600 text-sm float-right"
              onClick={() => removeTestCase(i)}
            >
              ❌ Remove
            </button>
          </p>

          <label className="block font-medium mt-2">Input:</label>
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows="2"
            value={tc.input}
            onChange={(e) => {
              const updated = [...testCases];
              updated[i].input = e.target.value;
              setTestCases(updated);
            }}
          />

          <label className="block font-medium">Expected Output:</label>
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows="2"
            value={tc.expected}
            onChange={(e) => {
              const updated = [...testCases];
              updated[i].expected = e.target.value;
              setTestCases(updated);
            }}
          />

          {tc.output && (
            <>
              <div className="bg-black text-green-300 p-3 rounded mt-2">
                <p className="text-white font-semibold">Output:</p>
                <pre>{tc.output}</pre>
              </div>
              <p className="mt-2 font-bold">
                Status:{" "}
                <span
                  className={
                    tc.status.includes("Passed")
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {tc.status}
                </span>
              </p>
            </>
          )}
        </div>
      ))}

      {/* Add Test Case Button */}
      <button
        onClick={addTestCase}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        ➕ Add Test Case
      </button>
    </div>
  );
};

export default Editor;
