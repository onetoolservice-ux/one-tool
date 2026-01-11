/**
 * Safe Math Expression Evaluator
 * Evaluates mathematical expressions without using eval() or Function()
 * Only supports basic arithmetic operations: +, -, *, /, parentheses, and numbers
 */

interface Token {
  type: 'number' | 'operator' | 'paren';
  value: string | number;
}

/**
 * Tokenize a mathematical expression
 */
function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let currentNumber = '';

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (char === ' ') {
      continue; // Skip whitespace
    }

    if (char >= '0' && char <= '9' || char === '.') {
      currentNumber += char;
    } else {
      if (currentNumber) {
        tokens.push({ type: 'number', value: parseFloat(currentNumber) });
        currentNumber = '';
      }

      if (char === '(' || char === ')') {
        tokens.push({ type: 'paren', value: char });
      } else if (['+', '-', '*', '/'].includes(char)) {
        tokens.push({ type: 'operator', value: char });
      }
    }
  }

  if (currentNumber) {
    tokens.push({ type: 'number', value: parseFloat(currentNumber) });
  }

  return tokens;
}

/**
 * Convert infix notation to postfix (RPN) using Shunting Yard algorithm
 */
function toPostfix(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const operators: Token[] = [];

  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
  };

  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token);
    } else if (token.type === 'operator') {
      while (
        operators.length > 0 &&
        operators[operators.length - 1].type === 'operator' &&
        precedence[operators[operators.length - 1].value as string] >= precedence[token.value as string]
      ) {
        output.push(operators.pop()!);
      }
      operators.push(token);
    } else if (token.value === '(') {
      operators.push(token);
    } else if (token.value === ')') {
      while (operators.length > 0 && operators[operators.length - 1].value !== '(') {
        output.push(operators.pop()!);
      }
      operators.pop(); // Remove '('
    }
  }

  while (operators.length > 0) {
    output.push(operators.pop()!);
  }

  return output;
}

/**
 * Evaluate postfix expression
 */
function evaluatePostfix(postfix: Token[]): number {
  const stack: number[] = [];

  for (const token of postfix) {
    if (token.type === 'number') {
      stack.push(token.value as number);
    } else if (token.type === 'operator') {
      const b = stack.pop()!;
      const a = stack.pop()!;

      switch (token.value) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          if (b === 0) {
            throw new Error('Division by zero');
          }
          stack.push(a / b);
          break;
      }
    }
  }

  return stack[0];
}

/**
 * Handle negative numbers and unary minus
 */
function preprocessExpression(expression: string): string {
  // Replace unary minus with (0 - x)
  let processed = expression.replace(/\(\s*-\s*(\d+\.?\d*)/g, '(0 - $1');
  processed = processed.replace(/^\s*-\s*(\d+\.?\d*)/, '0 - $1');
  
  return processed;
}

/**
 * Safely evaluate a mathematical expression
 * @param expression - Mathematical expression string (e.g., "2 + 3 * 4")
 * @returns Result number or throws error
 */
export function safeEvaluate(expression: string): number {
  // Sanitize input - only allow numbers, operators, parentheses, spaces, and decimal points
  const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
  
  if (sanitized !== expression.trim()) {
    throw new Error('Invalid characters in expression');
  }

  // Check for balanced parentheses
  const openParens = (sanitized.match(/\(/g) || []).length;
  const closeParens = (sanitized.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    throw new Error('Unbalanced parentheses');
  }

  if (!sanitized.trim()) {
    throw new Error('Empty expression');
  }

  try {
    const processed = preprocessExpression(sanitized);
    const tokens = tokenize(processed);
    
    if (tokens.length === 0) {
      throw new Error('No valid tokens found');
    }

    const postfix = toPostfix(tokens);
    const result = evaluatePostfix(postfix);

    if (!isFinite(result)) {
      throw new Error('Result is not a finite number');
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Evaluation failed');
  }
}
