import { useState } from "react";

const SYSTEM_PROMPT = `You are CLARA — Client Log And Response Assistant. You are an experienced investment and life insurance professional. You convert raw dictated case notes into clean outputs for four audiences.

INPUT: Raw dictated notes about a customer interaction. May be rambling or disjointed. Self-corrections: the second statement always overrides the first. Never interpolate, infer, or fill gaps — if something is genuinely unclear and the output literally cannot be completed without it, add it to the clarifications list.

OUTPUT: Return ONLY a valid JSON object. No markdown, no backticks, no explanation. Exactly this structure:
{
  "clarifications": [],
  "eagent": "...",
  "ipf": "...",
  "customer_needed": true or false,
  "customer_subject": "...",
  "customer_body": "...",
  "agency_needed": true or false,
  "agency_subject": "...",
  "agency_body": "..."
}

If nothing needs clarification, return an empty array for clarifications.
If customer email is not needed, set customer_needed to false and leave subject and body as empty strings.
If no referring agency is mentioned, set agency_needed to false and leave subject and body as empty strings.

GLOBAL RULES:
- NEVER use em dashes. Not once. Replace with a colon, a period, or restructure the sentence.
- NEVER use the word "client" — use "customer" only when a reference is truly needed
- NEVER use bullet points
- Plain text only, no markdown, no formatting symbols
- Use "follow through" not "follow up"
- Preserve all specific numbers, dollar amounts, phone numbers, and dates exactly as stated
- Never editorialize or add information not present in the dictation
- Never carry product names or case details from previous cases

PRODUCT GLOSSARY — always spell exactly as shown:
Lincoln Financial Group (LFG): TermAccel, LifeElements, WealthProtector

NOTE STRUCTURE — applies to both eAgent and IPF:
Write three flowing paragraphs in this order. No section labels. No headers. Just the paragraphs.
First paragraph: The customer's problem in plain human terms. No product language. What pain are they trying to solve?
Second paragraph: The general solution category being explored. No product names.
Third paragraph: Specific products quoted, numbers, underwriting flags, next steps.

One blank line between each paragraph. Short and scannable. Complete sentences not required.

eAGENT NOTE:
- Official permanent activity log entry
- Tone: Informal and transactional, internal shorthand to a colleague
- Never mention the referral source, agency name, or referring agent name — that information exists only to populate the agency email
- Never use the customer name unless multiple people are being discussed in the same note and a name is needed to distinguish them. If only one customer is discussed, omit the name entirely — it already exists in the record header
- Never say "spoke with customer" — just state what happened directly
- Health details and underwriting flags belong here
- Product names belong here
- If a secondary prospect was mentioned, note it

IPF NOTE:
- Same structure and tone as eAgent
- Default to identical wording unless a PII conflict exists
- Never mention the referral source, agency name, or referring agent name
- Never use the customer name unless multiple people are being discussed in the same note and a name is needed to distinguish them
- No policy numbers, no medication lists, no ID numbers
- Basic health flags are fine

CUSTOMER EMAIL:
- Set customer_needed to true only if there is something actionable to communicate
- Subject: Short and factual, no customer name
- Body: Begin with "Dear [First Name]," followed by one blank line
- Short single-idea paragraphs — people read on their phones
- We sell solutions, not products. Never use product names. Use: "term coverage", "permanent life insurance", "universal life policy"
- No fluff, no softening language, direct and respectful of their time
- No closing line — dynamic signature added automatically
- Include plain text rate tables if rates were discussed

AGENCY EMAIL:
- Set agency_needed to true only if a referring agent is mentioned
- 30,000-foot status update only — brief, no unnecessary detail
- The referring agent already knows who they sent and why
- Subject: Customer full name, colon, short status
- Body: Begin with "Dear [Referrer First Name],"
- Short paragraphs covering high-level discussion, status, next step
- No closing line

CLARIFICATIONS:
- Fire ONLY if the output literally cannot be completed without the missing information
- Example of a valid clarification: a referring agent is mentioned but their name was never given
- Do NOT fire for: which family member a health condition belongs to (assume the primary customer), whether existing policy details should go in the email (always keep internal), vague family mentions that do not affect the quote
- Do NOT fire for product names in customer-facing outputs — use solution language instead
- Do NOT fire for minor details that do not change any output`;

const OutputBlock = ({ label, content, emptyMessage }) => {
  const [copied, setCopied] = useState(false);
  const isEmpty = !content;

  return (
    <div style={{ marginBottom: "16px", border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 14px", background: isEmpty ? "#f9f9f9" : "#f0f4f8",
        borderBottom: "1px solid #ddd"
      }}>
        <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: isEmpty ? "#aaa" : "#2c5282" }}>{label}</span>
        {!isEmpty && (
          <button onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{
              background: copied ? "#c6f6d5" : "#fff", border: `1px solid ${copied ? "#68d391" : "#cbd5e0"}`,
              color: copied ? "#276749" : "#4a5568", padding: "2px 12px", borderRadius: "4px",
              fontSize: "11px", fontWeight: "600", cursor: "pointer"
            }}>{copied ? "Copied!" : "Copy"}</button>
        )}
      </div>
      <div style={{
        padding: "12px 14px", fontSize: "15px", lineHeight: "1.75",
        color: isEmpty ? "#bbb" : "#1a202c", whiteSpace: "pre-wrap",
        background: "#fff", minHeight: "50px", fontFamily: "Georgia, serif"
      }}>{isEmpty ? (emptyMessage || "Not applicable") : content}</div>
    </div>
  );
};

const EmailBlock = ({ label, subject, body, emptyMessage }) => {
  const [copied, setCopied] = useState(false);
  const isEmpty = !subject && !body;

  return (
    <div style={{ marginBottom: "16px", border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 14px", background: isEmpty ? "#f9f9f9" : "#f0f4f8",
        borderBottom: "1px solid #ddd"
      }}>
        <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: isEmpty ? "#aaa" : "#2c5282" }}>{label}</span>
        {!isEmpty && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => { navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{
                background: copied ? "#c6f6d5" : "#fff", border: `1px solid ${copied ? "#68d391" : "#cbd5e0"}`,
                color: copied ? "#276749" : "#4a5568", padding: "2px 12px", borderRadius: "4px",
                fontSize: "11px", fontWeight: "600", cursor: "pointer"
              }}>{copied ? "Copied!" : "Copy"}</button>
            <button onClick={() => { window.location.href = `mailto:?subject=${encodeURIComponent(subject || "")}&body=${encodeURIComponent(body || "")}`; }}
              style={{
                background: "#ebf4ff", border: "1px solid #bee3f8",
                color: "#2b6cb0", padding: "2px 12px", borderRadius: "4px",
                fontSize: "11px", fontWeight: "600", cursor: "pointer"
              }}>Open in Outlook</button>
          </div>
        )}
      </div>
      {!isEmpty && (
        <div style={{ padding: "8px 14px", background: "#f7fafc", borderBottom: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#718096", marginRight: "8px" }}>SUBJECT:</span>
          <span style={{ fontSize: "15px", color: "#2d3748" }}>{subject}</span>
        </div>
      )}
      <div style={{
        padding: "12px 14px", fontSize: "15px", lineHeight: "1.75",
        color: isEmpty ? "#bbb" : "#1a202c", whiteSpace: "pre-wrap",
        background: "#fff", minHeight: "50px", fontFamily: "Georgia, serif"
      }}>{isEmpty ? (emptyMessage || "Not applicable") : body}</div>
    </div>
  );
};

export default function CLARA() {
  const [input, setInput] = useState("");
  const [addendum, setAddendum] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState(null);
  const [error, setError] = useState("");

  const callCLARA = async (userContent) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/clara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContent }]
        })
      });
      const data = await response.json();
      if (!response.ok) {
        const msg = data?.error?.message || data?.error || JSON.stringify(data);
        throw new Error(`API ${response.status}: ${msg}`);
      }
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setOutputs(JSON.parse(clean));
      setAddendum("");
    } catch (err) {
      setError("Something went wrong: " + err.message);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setInput("");
    setAddendum("");
    setOutputs(null);
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", fontFamily: "Arial, sans-serif", padding: "24px 40px" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #2c5282" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#718096", marginBottom: "4px", textTransform: "uppercase" }}>Allstate EFS</div>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#2c5282", margin: "0 0 2px 0" }}>CLARA</h1>
        <div style={{ fontSize: "11px", color: "#a0aec0", letterSpacing: "0.08em", textTransform: "uppercase" }}>Client Log And Response Assistant</div>
      </div>

      {/* Input */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
          Dictation Input
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Paste or dictate your case notes here..."
          style={{
            width: "100%", minHeight: "250px", background: "#fff",
            border: "1px solid #cbd5e0", borderRadius: "6px", color: "#1a202c",
            fontFamily: "Arial, sans-serif", fontSize: "15px", lineHeight: "1.6",
            padding: "12px 14px", resize: "vertical", outline: "none",
            boxSizing: "border-box"
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <button
          onClick={() => callCLARA(input.trim())}
          disabled={loading || !input.trim()}
          style={{
            flex: 1, padding: "12px",
            background: loading || !input.trim() ? "#e2e8f0" : "#2c5282",
            color: loading || !input.trim() ? "#a0aec0" : "#fff",
            border: "none", borderRadius: "6px", fontFamily: "Arial, sans-serif",
            fontSize: "13px", fontWeight: "700", letterSpacing: "0.08em",
            textTransform: "uppercase", cursor: loading || !input.trim() ? "not-allowed" : "pointer"
          }}>
          {loading ? "Generating..." : "Generate Outputs"}
        </button>
        {outputs && (
          <button onClick={handleReset}
            style={{
              padding: "12px 20px", background: "#fff", color: "#718096",
              border: "1px solid #cbd5e0", borderRadius: "6px",
              fontFamily: "Arial, sans-serif", fontSize: "13px", fontWeight: "700",
              letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer"
            }}>New Case</button>
        )}
      </div>

      {error && (
        <div style={{
          color: "#c53030", fontSize: "15px", marginBottom: "16px",
          padding: "12px 14px", border: "1px solid #feb2b2",
          borderRadius: "6px", background: "#fff5f5"
        }}>{error}</div>
      )}

      {/* Outputs */}
      {outputs && (
        <>
          {outputs.clarifications && outputs.clarifications.length > 0 && (
            <div style={{
              marginBottom: "20px", padding: "14px 16px",
              border: "1px solid #f6ad55", borderRadius: "6px", background: "#fffaf0"
            }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#c05621", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Clarification Needed</div>
              {outputs.clarifications.map((q, i) => (
                <div key={i} style={{ fontSize: "15px", color: "#7b341e", lineHeight: "1.6", marginBottom: "4px" }}>{i + 1}. {q}</div>
              ))}
            </div>
          )}

          <div style={{ fontSize: "11px", fontWeight: "700", color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e2e8f0" }}>Outputs</div>

          <OutputBlock label="eAgent Note" content={outputs.eagent} />
          <OutputBlock label="IPF Note" content={outputs.ipf} />
          <EmailBlock label="Customer Email" subject={outputs.customer_subject} body={outputs.customer_body} emptyMessage="No customer follow-through needed" />
          <EmailBlock label="Agency Email" subject={outputs.agency_subject} body={outputs.agency_body} emptyMessage="No referring agency on this case" />

          {/* Addendum */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              Add Context or Corrections
            </label>
            <textarea
              value={addendum}
              onChange={e => setAddendum(e.target.value)}
              placeholder="Something missing or needs changing? Add it here and regenerate..."
              style={{
                width: "100%", minHeight: "70px", background: "#fff",
                border: "1px solid #cbd5e0", borderRadius: "6px", color: "#1a202c",
                fontFamily: "Arial, sans-serif", fontSize: "15px", lineHeight: "1.6",
                padding: "10px 14px", resize: "vertical", outline: "none",
                boxSizing: "border-box", marginBottom: "10px"
              }}
            />
            <button
              onClick={() => callCLARA(`ORIGINAL NOTES:\n${input.trim()}\n\nADDITIONAL CONTEXT TO INCORPORATE:\n${addendum.trim()}`)}
              disabled={loading || !addendum.trim()}
              style={{
                padding: "9px 22px",
                background: loading || !addendum.trim() ? "#e2e8f0" : "#fff",
                color: loading || !addendum.trim() ? "#a0aec0" : "#2c5282",
                border: `1px solid ${loading || !addendum.trim() ? "#e2e8f0" : "#2c5282"}`,
                borderRadius: "6px", fontFamily: "Arial, sans-serif", fontSize: "13px",
                fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase",
                cursor: loading || !addendum.trim() ? "not-allowed" : "pointer"
              }}>Regenerate with Additions</button>
          </div>
        </>
      )}
    </div>
  );
}
