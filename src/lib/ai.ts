import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

interface StreamResponse {
  stream: AsyncGenerator<{ text: () => string }>;
}

// Add Vite's ImportMeta interface augmentation
// Initialize the AI model with proper error handling
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Validate API key format (basic check)
const isValidApiKey = (key: string | undefined): boolean => {
  return Boolean(key && typeof key === 'string' && key.length > 20);
};

// Initialize the AI client with error handling
let genAI: GoogleGenerativeAI;
let model: GenerativeModel;

try {
  if (!isValidApiKey(API_KEY)) {
    throw new Error('Invalid or missing Google AI API key');
  }
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-pro" });
} catch (error) {
  console.error('Error initializing AI client:', error);
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export interface PaperReview {
  summary: string;
  novelty: string;
  suggestedQuestions: string[];
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retry<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('network')) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function* generateObsidianNote(paper: {
  id: string;
  title: string;
  abstract: string;
  authors: Array<{ name: string; user?: { fullname?: string } }>;
  publicationDate: string;
  tags: string[];
}): AsyncGenerator<string> {
  if (!model) {
    throw new Error('AI model not initialized. Please check your API key configuration.');
  }

  try {
    const prompt = `Create a comprehensive research note for Obsidian about this academic paper.
Here's the paper abstract to analyze:
${paper.abstract}

The note must follow this exact template:

---
id: ${paper.id}
created_date: ${new Date().toISOString().split('T')[0]}
updated_date: ${new Date().toISOString().split('T')[0]}
type: note
---

# ${paper.title}
- **🏷️Tags** : #${new Date().toLocaleString('default', { month: '2-digit' })}-${new Date().getFullYear()} ${paper.tags.map(tag => `#${tag}`).join(' ')}
also add tags that you can analyze from the paper content (#NLP, #CV, #reasoning, #large_language_model ...)
## 📝 Notes
[Provide a detailed analysis of the paper, including:
- Main objective and motivation
- Key methodology and approach
- Important findings and results
- Technical contributions
- Potential applications and impact
Use bullet points for better readability]

## 🔗 Links
- Authors: ${paper.authors.map(author => author.user?.fullname || author.name).join(', ')}
- Published: ${new Date(paper.publicationDate).toLocaleDateString()}
- [View Paper](https://arxiv.org/abs/${paper.id})
- [PDF](https://arxiv.org/pdf/${paper.id}.pdf)



Important:
1. Keep the exact template format
2. Use clear, concise bullet points
3. Focus on technical details and contributions
4. Include practical applications
5. Maintain academic tone`;

    const result = await retry(() => model.generateContentStream(prompt)) as StreamResponse;

    for await (const chunk of result.stream) {
      try {
        yield chunk.text();
      } catch (error) {
        console.error('Error processing chunk:', error);
        // Continue with next chunk
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error generating note:', message);
    throw new Error(`Failed to generate note: ${message}`);
  }
}

export async function* streamInitialPaperReview(paper: { title: string; abstract: string }): AsyncGenerator<Partial<PaperReview>> {
  if (!model) {
    throw new Error('AI model not initialized. Please check your API key configuration.');
  }

  try {
    const prompt = `As an expert research assistant, analyze this academic paper and provide a detailed review. Your analysis should include:

1. SUMMARY (2-3 sentences):
   - Clearly explain the paper's main objective
   - Highlight the key methodology used
   - Mention the primary results or conclusions

2. NOVELTY AND IMPACT:
   - Identify the main technical innovation or novel contribution
   - Explain why this is significant for the field
   - Highlight potential real-world applications

3. SUGGESTED QUESTIONS:
   - Provide exactly 3 thought questions about the paper that could guide further discussion or research
   - The question must be can be answered based on the paper content

Format your response EXACTLY like this:
SUMMARY: [Your comprehensive summary here]
NOVELTY: [Your analysis of the paper's innovations and significance]
QUESTIONS:
1. [First complete question]
2. [Second complete question]
3. [Third complete question]

Here's the paper:
Title: ${paper.title}
Abstract: ${paper.abstract}`;

    const result = await retry(() => model.generateContentStream(prompt)) as StreamResponse;
    let fullResponse = '';

    for await (const chunk of result.stream) {
      try {
        const chunkText = chunk.text();
        fullResponse += chunkText;

        // Try to parse the current accumulated response
        const summaryMatch = fullResponse.match(/SUMMARY:\s*([\s\S]*?)(?=NOVELTY:|$)/);
        const noveltyMatch = fullResponse.match(/NOVELTY:\s*([\s\S]*?)(?=QUESTIONS:|$)/);
        const questionsMatch = fullResponse.match(/QUESTIONS:\s*([\s\S]*?)(?=$)/);

        const partialReview: Partial<PaperReview> = {};

        if (summaryMatch) {
          partialReview.summary = summaryMatch[1].trim();
        }

        if (noveltyMatch) {
          partialReview.novelty = noveltyMatch[1].trim();
        }

        if (questionsMatch) {
          const questions = questionsMatch[1]
            .split(/\d+\.\s+/)
            .filter(q => q.trim().length > 0)
            .map(q => q.trim());

          if (questions.length > 0) {
            partialReview.suggestedQuestions = questions;
          }
        }

        yield partialReview;
      } catch (error) {
        console.error('Error processing chunk:', error);
        // Continue processing remaining chunks
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error generating initial review:', message);
    throw new Error(`Failed to generate paper review: ${message}`);
  }
}

export async function* streamChatWithPaper(
  paper: { title: string; abstract: string },
  question: string,
  history: Message[] = []
): AsyncGenerator<string> {
  if (!model) {
    throw new Error('AI model not initialized. Please check your API key configuration.');
  }

  try {
    const context = `
Title: ${paper.title}
Abstract: ${paper.abstract}
`;

    const systemPrompt = `You are an expert research assistant specializing in academic paper analysis. Your task is to answer questions about the paper using a clear, academic style with proper citations.

Paper Context:
${context}

Previous conversation:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Question: ${question}

Guidelines for your response:
1. Use Markdown formatting for better readability
2. Structure your answer with clear sections when appropriate
3. Always cite specific parts of the paper using quotes and section references
4. If information isn't available in the paper, clearly state this
5. Keep responses concise but thorough
6. Use bullet points or numbered lists for multiple points
7. Format quotes from the paper like this: "> [quote]"

Example format:

Based on the paper's [section/content], [your analysis...]

> "[relevant quote from paper]"

This demonstrates [explanation...]

Key points:
• [point 1]
• [point 2]

If you cannot answer based on the paper's content, respond with:

"I apologize, but I cannot find sufficient information in the provided paper content to answer this question accurately. The paper's abstract does not contain details about [topic]."`;

    const result = await retry(() => model.generateContentStream(systemPrompt)) as StreamResponse;

    for await (const chunk of result.stream) {
      try {
        yield chunk.text();
      } catch (error) {
        console.error('Error processing chunk:', error);
        // Continue with next chunk
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error generating AI response:', message);
    throw new Error(`Failed to generate AI response: ${message}`);
  }
}