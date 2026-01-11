"use client";
import React, { useState } from 'react';
import { Sparkles, Copy, Wand2, Check } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

// Interface for analyzing user input
interface InputAnalysis {
  domain: string;
  intent: string;
  depth: 'basic' | 'intermediate' | 'advanced';
  outputType: string;
  keywords: string[];
}

/**
 * Analyzes user input to infer domain, intent, depth, and expected output format.
 * Uses keyword matching and heuristics to determine the context.
 */
function analyzeInput(input: string): InputAnalysis {
  const text = input.toLowerCase();
  const words = text.split(/\s+/);
  
  // Domain detection (what field/area)
  let domain = 'General';
  const domainKeywords: Record<string, string[]> = {
    'Software Development': ['code', 'programming', 'developer', 'function', 'algorithm', 'api', 'database', 'framework', 'software', 'application', 'website', 'app', 'script'],
    'Data Science': ['data', 'analysis', 'machine learning', 'ml', 'ai', 'model', 'dataset', 'statistics', 'prediction', 'analytics'],
    'Business': ['business', 'marketing', 'sales', 'strategy', 'customer', 'revenue', 'profit', 'market', 'product', 'service', 'brand'],
    'Writing': ['write', 'article', 'blog', 'content', 'essay', 'story', 'novel', 'copy', 'text', 'document'],
    'Design': ['design', 'ui', 'ux', 'interface', 'visual', 'layout', 'graphic', 'color', 'typography', 'wireframe'],
    'Education': ['learn', 'teach', 'education', 'course', 'lesson', 'study', 'student', 'curriculum'],
    'Science': ['research', 'hypothesis', 'experiment', 'study', 'scientific', 'theory', 'methodology'],
    'Finance': ['financial', 'investment', 'budget', 'money', 'finance', 'economy', 'trading', 'stock'],
    'Healthcare': ['health', 'medical', 'patient', 'treatment', 'diagnosis', 'therapy', 'medicine'],
  };
  
  for (const [key, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      domain = key;
      break;
    }
  }
  
  // Intent detection (what the user wants to do)
  let intent = 'create or generate';
  const intentKeywords: Record<string, string[]> = {
    'analyze': ['analyze', 'analysis', 'evaluate', 'assess', 'examine', 'review'],
    'create': ['create', 'make', 'build', 'generate', 'design', 'write', 'develop'],
    'explain': ['explain', 'describe', 'clarify', 'define', 'understand', 'how'],
    'improve': ['improve', 'optimize', 'enhance', 'better', 'refine', 'upgrade'],
    'plan': ['plan', 'strategy', 'roadmap', 'approach', 'method', 'process'],
    'solve': ['solve', 'fix', 'resolve', 'debug', 'troubleshoot', 'error'],
  };
  
  for (const [key, keywords] of Object.entries(intentKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      intent = key;
      break;
    }
  }
  
  // Depth estimation (based on complexity indicators)
  let depth: 'basic' | 'intermediate' | 'advanced' = 'intermediate';
  const advancedKeywords = ['complex', 'advanced', 'comprehensive', 'detailed', 'thorough', 'sophisticated', 'enterprise', 'scalable'];
  const basicKeywords = ['simple', 'basic', 'quick', 'easy', 'beginner', 'introductory'];
  
  if (advancedKeywords.some(kw => text.includes(kw)) || words.length > 30) {
    depth = 'advanced';
  } else if (basicKeywords.some(kw => text.includes(kw)) || words.length < 10) {
    depth = 'basic';
  }
  
  // Output type detection
  let outputType = 'text response';
  const outputKeywords: Record<string, string[]> = {
    'code': ['code', 'function', 'script', 'program', 'implementation', 'class', 'method'],
    'table': ['table', 'list', 'chart', 'comparison', 'matrix'],
    'steps': ['steps', 'process', 'procedure', 'guide', 'instructions', 'tutorial'],
    'diagram': ['diagram', 'flowchart', 'visual', 'chart', 'graph', 'model'],
    'checklist': ['checklist', 'check', 'todo', 'tasks', 'items'],
    'analysis': ['analysis', 'report', 'evaluation', 'review', 'assessment'],
  };
  
  for (const [key, keywords] of Object.entries(outputKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      outputType = key;
      break;
    }
  }
  
  // Extract key terms (non-common words)
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'what', 'how', 'when', 'where', 'why']);
  const keywords = words.filter(w => w.length > 3 && !commonWords.has(w)).slice(0, 5);
  
  return { domain, intent, depth, outputType, keywords };
}

/**
 * Generates a high-quality AI prompt following the exact structure:
 * ROLE, CONTEXT, TASK, CONSTRAINTS, OUTPUT, CRITIQUE
 */
function generatePrompt(userInput: string, analysis: InputAnalysis): string {
  const { domain, intent, depth, outputType, keywords } = analysis;
  
  // ROLE: Authoritative and domain-specific
  const roles: Record<string, string> = {
    'Software Development': 'You are a senior full-stack engineer and software architect with expertise in modern development practices.',
    'Data Science': 'You are a senior data scientist and ML engineer with deep expertise in data analysis and machine learning.',
    'Business': 'You are a senior business strategist and consultant with extensive experience in business operations and strategy.',
    'Writing': 'You are a professional writer and content strategist with expertise in various writing styles and formats.',
    'Design': 'You are a senior UX/UI designer and design system architect with expertise in user-centered design.',
    'Education': 'You are an experienced educator and curriculum designer with expertise in pedagogy and learning design.',
    'Science': 'You are a senior researcher and scientist with expertise in scientific methodology and research design.',
    'Finance': 'You are a senior financial analyst and investment advisor with expertise in financial planning and analysis.',
    'Healthcare': 'You are a senior healthcare professional and medical consultant with expertise in clinical practice.',
    'General': 'You are a senior expert and consultant with broad expertise across multiple domains.',
  };
  const role = roles[domain] || roles['General'];
  
  // CONTEXT: Background and situation
  const contextDepth = {
    basic: 'Provide a clear and straightforward approach suitable for beginners.',
    intermediate: 'Provide a comprehensive approach suitable for practitioners with some experience.',
    advanced: 'Provide a sophisticated and detailed approach suitable for experts and enterprise-level implementations.',
  };
  const context = `You are working on a ${domain.toLowerCase()} project. The user needs assistance with: "${userInput}". ${contextDepth[depth]}`;
  
  // TASK: Precise, measurable outcome
  const taskVerbs: Record<string, string> = {
    'analyze': 'Analyze and evaluate',
    'create': 'Create and develop',
    'explain': 'Explain and describe',
    'improve': 'Improve and optimize',
    'plan': 'Plan and strategize',
    'solve': 'Solve and resolve',
  };
  const taskVerb = taskVerbs[intent] || 'Create and develop';
  const task = `${taskVerb} a solution that addresses: "${userInput}". The solution should be actionable, well-structured, and directly applicable.`;
  
  // CONSTRAINTS: Assumptions, tools, depth, limits
  const constraints = [
    `Focus on ${domain.toLowerCase()} best practices and industry standards.`,
    `Ensure the solution is appropriate for ${depth} level expertise.`,
    `Use modern, relevant tools and technologies where applicable.`,
    `Consider scalability, maintainability, and practical implementation.`,
    `If ${outputType !== 'text response'}, provide output in ${outputType} format.`,
    `Be concise but thorough - prioritize quality over quantity.`,
  ].join('\n');
  
  // OUTPUT: Concrete format specification
  const outputFormats: Record<string, string> = {
    'code': 'Provide clean, well-commented code with examples. Include error handling and best practices.',
    'table': 'Present the information in a well-structured table format with clear headers and organized data.',
    'steps': 'Provide a numbered step-by-step guide with clear instructions and explanations for each step.',
    'diagram': 'Describe the structure visually using text-based diagrams (ASCII art or structured text representation).',
    'checklist': 'Provide a comprehensive checklist with actionable items organized by category or priority.',
    'analysis': 'Provide a structured analysis with sections for findings, insights, recommendations, and next steps.',
    'text response': 'Provide a well-structured response with clear sections, headings, and organized content.',
  };
  const outputFormat = outputFormats[outputType] || outputFormats['text response'];
  const output = `${outputFormat} Ensure the output is immediately usable and professionally formatted.`;
  
  // CRITIQUE: Self-review and improvements
  const critique = `After completing the task, review your response and:
- Verify that all requirements are met
- Check for clarity, accuracy, and completeness
- Identify any potential improvements or alternative approaches
- Suggest follow-up actions or considerations if applicable
- Ensure the solution is practical and implementable`;
  
  // Assemble the prompt in exact order
  return `ROLE:
${role}

CONTEXT:
${context}

TASK:
${task}

CONSTRAINTS:
${constraints}

OUTPUT:
${output}

CRITIQUE:
${critique}`;
}

export const PromptGenerator = () => {
  const [input, setInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  
  const handleGenerate = () => {
    if (!input.trim()) {
      showToast("Please enter a goal or problem statement", "error");
      return;
    }
    
    // Analyze input
    const analysis = analyzeInput(input);
    
    // Generate prompt
    const prompt = generatePrompt(input, analysis);
    setGeneratedPrompt(prompt);
    setCopied(false);
  };
  
  const handleCopy = async () => {
    if (!generatedPrompt) return;
    
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      showToast("Prompt copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast("Failed to copy prompt", "error");
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto p-6 h-[calc(100vh-80px)] flex flex-col gap-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-12 h-12 bg-fuchsia-500/10 rounded-xl flex items-center justify-center text-fuchsia-500">
            <Sparkles size={24} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Prompt Generator</h1>
        <p className="text-slate-500 dark:text-slate-400">Generate high-quality AI prompts from your goals and problem statements</p>
      </div>
      
      {/* Input Section */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left: Input */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Wand2 size={18} className="text-fuchsia-500" />
            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Goal or Problem Statement
            </label>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to achieve or the problem you need to solve. For example: 'Create a REST API for user authentication' or 'Analyze sales data to identify trends' or 'Write a blog post about sustainable energy'..."
            className="flex-1 p-6 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-600 rounded-2xl resize-none outline-none text-sm leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
          />
          <button
            onClick={handleGenerate}
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-3 px-6 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Wand2 size={18} />
            Generate Prompt
          </button>
        </div>
        
        {/* Right: Output */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-fuchsia-500" />
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Generated Prompt
              </label>
            </div>
            {generatedPrompt && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea
            value={generatedPrompt}
            readOnly
            placeholder="Generated prompt will appear here..."
            className="flex-1 p-6 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-2xl resize-none outline-none font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>
      </div>
      
      {/* Info Footer */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500">
        The generated prompt follows a structured framework to ensure high-quality AI responses. All analysis is done locally in your browser.
      </div>
    </div>
  );
};
