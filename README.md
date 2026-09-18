# HR-Assist RAG

## What is this?

HR-Assist is a RAG-based HR Policy Q&A bot that helps employees get instant answers to common questions about leave, insurance, WFH, and reimbursement — grounded in the company's actual HR policy documents, not guesswork.

## How it works

An employee asks a question in natural language. The system retrieves the most relevant section of the HR policy documents using embeddings and similarity search, then passes that context to an LLM to generate a grounded answer. If the question isn't covered by the documents, it's escalated to HR instead of risking an incorrect answer.

See [Architecture](docs/Architecture.md) for more details.

## Tech Stack

* n8n
* Groq (LLM)
* Hugging Face (embeddings)
* Google Sheets (logging)

## Project Docs

* [PRD](docs/PRD.md)
* [TRD](docs/TRD.md)
* [Architecture](docs/Architecture.md)
* [Feature List](docs/Feature.md)
* [API/Integration](docs/API-Integration.md)
* [Testing & QA](docs/Testing-QA.md)

## Status

🚧 In progress — Day 1: planning & repo setup complete