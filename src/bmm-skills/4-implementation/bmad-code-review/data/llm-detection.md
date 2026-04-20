# LLM Integration Detection

**Consumed by:** sub-axis 3b (AI / Agentic Safety) activation trigger in step-01-gather-context.

Meta-3 sub-axis 3b activates when the diff introduces or modifies LLM SDK usage.

---

## SDK import signals

Scan `CHANGED_FILES` for imports from any of:

| Ecosystem | Packages |
|-----------|----------|
| Anthropic | `@anthropic-ai/sdk`, `@anthropic-ai/bedrock-sdk`, `@anthropic-ai/vertex-sdk` |
| OpenAI | `openai`, `@azure/openai` |
| LangChain | `langchain`, `@langchain/core`, `@langchain/anthropic`, `@langchain/openai`, `@langchain/community` |
| LlamaIndex | `llamaindex`, `@llamaindex/core`, `@llamaindex/openai` |
| Vercel AI SDK | `ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai` |
| MCP | `@modelcontextprotocol/sdk`, `mcp` |
| Google | `@google/generative-ai`, `@google-cloud/vertexai` |
| Mistral | `@mistralai/mistralai` |
| Cohere | `cohere-ai` |
| Python | `anthropic`, `openai`, `langchain`, `llama-index`, `mistralai`, `cohere`, `google-generativeai`, `vertexai` |

### Grep patterns (multi-stack)

```bash
# TypeScript / JavaScript
grep -rn "from '@anthropic-ai\|from 'openai\|from 'langchain\|from 'llamaindex\|from '@modelcontextprotocol\|from 'ai'" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" $CHANGED_FILES_DIRS

# Python
grep -rn "^import anthropic\|^from anthropic\|^import openai\|^from openai\|^from langchain\|^import llama_index\|^from llama_index" --include="*.py" $CHANGED_FILES_DIRS

# Go
grep -rn "github.com/anthropics/anthropic-sdk-go\|github.com/sashabaranov/go-openai\|github.com/tmc/langchaingo" --include="*.go" $CHANGED_FILES_DIRS
```

Any match → sub-axis 3b activates with `pattern_matched: {sdk_name}`.

---

## Agentic patterns to flag

When sub-axis 3b activates, scan for the following high-risk patterns:

### Tool definitions without permission gating

```typescript
tools: [
  { name: 'delete_database', handler: async () => { /* no approval gate */ } }
]
```

Tools that can delete / write / exfiltrate data without:
- A trust-tier tag (`trust_tier: 'high' | 'medium' | 'low'`)
- A human-approval gate (`requiresApproval: true` or equivalent)
- An audit log of each invocation

→ **BLOCKER** (maps to OWASP LLM06 Excessive Agency + ASI08 Excessive Autonomy).

### Unsanitised tool input flowing into prompts

User-provided data inserted directly into the system prompt without escaping or boundary markers → **BLOCKER** (OWASP LLM01 Prompt Injection).

### Memory / retrieval without poisoning defense

Long-term memory stores (vector DB, chat history persistence) that ingest user content without:
- Provenance tagging (where did this content come from?)
- Trust-tier filtering at retrieval time
- Anomaly detection on new memory writes

→ WARNING (OWASP LLM06 + ASI01 Memory Poisoning — MINJA research shows >95% injection rate on naive implementations).

### Unbounded agent loops

Agent loops without a step budget, wall-clock timeout, or cost cap → WARNING (ASI10 Agent Lifecycle Issues).

### System prompt leaked through error paths

Error responses that echo the system prompt back to the user → **BLOCKER** (system prompt disclosure).

---

## OWASP LLM / Agentic tag mapping

Each sub-axis 3b finding MUST carry either an `llm_risk` or `asi_risk` tag pointing to `data/owasp-llm-top-10.md`. Findings without a risk tag are rejected by judge-triage.
