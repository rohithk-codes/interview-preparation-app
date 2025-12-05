import dotenv from 'dotenv';
import connectDB from '../config/db';
import InterviewQuestion from '../models/chat/InterviewQuestion';

dotenv.config();

const sampleQuestions = [
  // JavaScript - Frontend - Easy
  {
    question: "What is the difference between let, const, and var in JavaScript?",
    category: "javascript",
    type: "frontend",
    difficulty: "easy",
    keywords: [
      { word: "scope", weight: 5, synonyms: ["scoping", "block scope"] },
      { word: "hoisting", weight: 4, synonyms: ["hoist", "hoisted"] },
      { word: "reassign", weight: 4, synonyms: ["reassignment", "change value"] },
      { word: "block", weight: 3, synonyms: ["block-scoped"] }
    ],
    idealAnswer: "let and const are block-scoped while var is function-scoped. const cannot be reassigned after declaration, let can be. var is hoisted to the top of its scope.",
    hints: [
      "Think about where these variables can be accessed",
      "Consider what happens when you try to change their values"
    ],
    followUpQuestions: [
      "Can you give an example of hoisting?",
      "What is the temporal dead zone?"
    ]
  },

  // JavaScript - Frontend - Medium
  {
    question: "Explain closures in JavaScript and provide a use case.",
    category: "javascript",
    type: "frontend",
    difficulty: "medium",
    keywords: [
      { word: "function", weight: 4, synonyms: ["functions"] },
      { word: "scope", weight: 5, synonyms: ["lexical scope", "outer scope"] },
      { word: "variable", weight: 3, synonyms: ["variables", "data"] },
      { word: "access", weight: 4, synonyms: ["accessing", "reach"] },
      { word: "private", weight: 3, synonyms: ["encapsulation", "privacy"] }
    ],
    idealAnswer: "A closure is a function that has access to variables in its outer scope even after the outer function has returned. Common use cases include data privacy, creating factory functions, and maintaining state.",
    hints: [
      "Think about function scope and lifetime",
      "Consider how inner functions can remember their environment"
    ],
    followUpQuestions: ["How do closures relate to memory management?"]
  },

  // JavaScript - Frontend - Medium
  {
    question: "What is event bubbling and event capturing in the DOM?",
    category: "javascript",
    type: "frontend",
    difficulty: "medium",
    keywords: [
      { word: "propagation", weight: 5, synonyms: ["event propagation", "flow"] },
      { word: "parent", weight: 3, synonyms: ["ancestor", "parent element"] },
      { word: "child", weight: 3, synonyms: ["descendant", "child element"] },
      { word: "stopPropagation", weight: 4, synonyms: ["stop", "prevent"] },
      { word: "bubble", weight: 3, synonyms: ["bubbling", "bubbles up"] }
    ],
    idealAnswer: "Event bubbling is when an event starts from the target element and bubbles up to parent elements. Event capturing is the opposite - it starts from the root and goes down to the target. You can use stopPropagation() to prevent further propagation.",
    hints: [
      "Think about the direction of event flow",
      "Consider the order in which event handlers are called"
    ],
    followUpQuestions: ["What is event delegation?"]
  },

  // JavaScript - Backend - Medium
  {
    question: "What is middleware in Express.js and how does it work?",
    category: "javascript",
    type: "backend",
    difficulty: "medium",
    keywords: [
      { word: "function", weight: 3, synonyms: ["functions"] },
      { word: "request", weight: 5, synonyms: ["req", "http request"] },
      { word: "response", weight: 5, synonyms: ["res", "http response"] },
      { word: "next", weight: 5, synonyms: ["next()", "call next"] },
      { word: "chain", weight: 3, synonyms: ["pipeline", "sequence"] }
    ],
    idealAnswer: "Middleware are functions that have access to request and response objects and the next middleware function. They can execute code, modify request/response, end the request-response cycle, or call the next middleware using next().",
    hints: [
      "Think about functions that run before your route handlers",
      "Consider the three parameters: req, res, next"
    ],
    followUpQuestions: ["What are some common middleware use cases?"]
  },

  // JavaScript - Backend - Easy
  {
    question: "What is the difference between SQL and NoSQL databases?",
    category: "javascript",
    type: "backend",
    difficulty: "easy",
    keywords: [
      { word: "schema", weight: 5, synonyms: ["structure", "structured"] },
      { word: "relational", weight: 4, synonyms: ["relations", "relationships"] },
      { word: "flexible", weight: 3, synonyms: ["flexibility", "dynamic"] },
      { word: "scale", weight: 4, synonyms: ["scaling", "scalability"] },
      { word: "document", weight: 3, synonyms: ["documents", "json"] }
    ],
    idealAnswer: "SQL databases are relational with fixed schemas and use tables. NoSQL databases are non-relational, have flexible schemas, and can be document-based, key-value, or graph databases. NoSQL is better for horizontal scaling.",
    hints: [
      "Think about structure and flexibility",
      "Consider how they handle scaling"
    ],
    followUpQuestions: ["When would you choose SQL over NoSQL?"]
  },

  // Python - Fullstack - Medium
  {
    question: "Explain decorators in Python.",
    category: "python",
    type: "fullstack",
    difficulty: "medium",
    keywords: [
      { word: "function", weight: 4, synonyms: ["functions"] },
      { word: "wrapper", weight: 5, synonyms: ["wrap", "wrapping"] },
      { word: "@", weight: 3, synonyms: ["@ symbol", "decorator syntax"] },
      { word: "modify", weight: 4, synonyms: ["change", "extend", "enhance"] },
      { word: "behavior", weight: 3, synonyms: ["functionality", "behaviour"] }
    ],
    idealAnswer: "Decorators are functions that modify the behavior of other functions. They use @ syntax and wrap the original function to add functionality before or after its execution without changing its code.",
    hints: [
      "Think about functions that take functions as arguments",
      "Consider how you can add functionality without modifying the original function"
    ],
    followUpQuestions: ["Can you write a simple decorator example?"]
  },

  // General - Fullstack - Easy
  {
    question: "What is the difference between authentication and authorization?",
    category: "general",
    type: "fullstack",
    difficulty: "easy",
    keywords: [
      { word: "identity", weight: 5, synonyms: ["who", "user identity"] },
      { word: "permission", weight: 5, synonyms: ["permissions", "access rights"] },
      { word: "verify", weight: 4, synonyms: ["verification", "validate"] },
      { word: "login", weight: 3, synonyms: ["sign in", "credentials"] },
      { word: "access", weight: 4, synonyms: ["allowed", "authorized"] }
    ],
    idealAnswer: "Authentication is verifying who you are (identity), typically through login credentials. Authorization is determining what you're allowed to do (permissions) after you're authenticated.",
    hints: [
      "Think about logging in vs accessing resources",
      "Consider 'who you are' vs 'what you can do'"
    ],
    followUpQuestions: ["What is JWT and how does it relate to authentication?"]
  },

  // JavaScript - Frontend - Hard
  {
    question: "Explain the concept of virtual DOM and how React uses it.",
    category: "javascript",
    type: "frontend",
    difficulty: "hard",
    keywords: [
      { word: "virtual", weight: 4, synonyms: ["virtual representation"] },
      { word: "dom", weight: 5, synonyms: ["document object model", "real dom"] },
      { word: "diff", weight: 5, synonyms: ["diffing", "reconciliation"] },
      { word: "performance", weight: 4, synonyms: ["efficient", "optimization"] },
      { word: "update", weight: 3, synonyms: ["updates", "re-render"] }
    ],
    idealAnswer: "Virtual DOM is a lightweight copy of the actual DOM. React uses it to efficiently update the UI by comparing the virtual DOM with the previous version (diffing), calculating minimal changes needed, and updating only those parts in the real DOM.",
    hints: [
      "Think about efficiency and performance",
      "Consider why direct DOM manipulation is slow"
    ],
    followUpQuestions: ["What is reconciliation in React?"]
  },

  // JavaScript - Backend - Hard
  {
    question: "What is the event loop in Node.js and how does it work?",
    category: "javascript",
    type: "backend",
    difficulty: "hard",
    keywords: [
      { word: "asynchronous", weight: 5, synonyms: ["async", "non-blocking"] },
      { word: "callback", weight: 4, synonyms: ["callbacks", "callback queue"] },
      { word: "queue", weight: 4, synonyms: ["task queue", "message queue"] },
      { word: "stack", weight: 4, synonyms: ["call stack"] },
      { word: "single-threaded", weight: 5, synonyms: ["single thread"] }
    ],
    idealAnswer: "The event loop is Node.js's mechanism for handling asynchronous operations despite being single-threaded. It continuously checks the call stack and callback queue, executing callbacks when the stack is empty.",
    hints: [
      "Think about how Node.js handles async operations",
      "Consider the role of callbacks and the call stack"
    ],
    followUpQuestions: ["What are microtasks and macrotasks?"]
  },

  // General - Fullstack - Medium
  {
    question: "What is REST API and what are its principles?",
    category: "general",
    type: "fullstack",
    difficulty: "medium",
    keywords: [
      { word: "stateless", weight: 5, synonyms: ["statelessness"] },
      { word: "http", weight: 4, synonyms: ["http methods", "verbs"] },
      { word: "resource", weight: 4, synonyms: ["resources"] },
      { word: "endpoint", weight: 3, synonyms: ["endpoints", "url"] },
      { word: "crud", weight: 3, synonyms: ["create", "read", "update", "delete"] }
    ],
    idealAnswer: "REST is an architectural style for APIs. Key principles include statelessness, client-server separation, using standard HTTP methods (GET, POST, PUT, DELETE), and treating everything as resources with unique URLs.",
    hints: [
      "Think about HTTP methods and their purposes",
      "Consider how data is represented and accessed"
    ],
    followUpQuestions: ["What is the difference between REST and GraphQL?"]
  },

  // Python - Backend - Easy
  {
    question: "What is the difference between list and tuple in Python?",
    category: "python",
    type: "backend",
    difficulty: "easy",
    keywords: [
      { word: "mutable", weight: 5, synonyms: ["mutability", "changeable"] },
      { word: "immutable", weight: 5, synonyms: ["immutability", "unchangeable"] },
      { word: "modify", weight: 3, synonyms: ["change", "edit"] },
      { word: "performance", weight: 3, synonyms: ["speed", "faster"] }
    ],
    idealAnswer: "Lists are mutable (can be changed) while tuples are immutable (cannot be changed). Tuples are faster and use less memory. Lists use square brackets [], tuples use parentheses ().",
    hints: [
      "Think about whether you can change the contents",
      "Consider the syntax differences"
    ],
    followUpQuestions: ["When would you use a tuple over a list?"]
  },

  // JavaScript - Frontend - Easy
  {
    question: "What is the difference between == and === in JavaScript?",
    category: "javascript",
    type: "frontend",
    difficulty: "easy",
    keywords: [
      { word: "equality", weight: 4, synonyms: ["equal", "comparison"] },
      { word: "type", weight: 5, synonyms: ["data type", "type checking"] },
      { word: "coercion", weight: 5, synonyms: ["type coercion", "conversion"] },
      { word: "strict", weight: 4, synonyms: ["strict equality"] }
    ],
    idealAnswer: "== checks for equality with type coercion (converts types if different), while === checks for strict equality without type coercion (both value and type must match).",
    hints: [
      "Think about type conversion",
      "Consider '5' == 5 vs '5' === 5"
    ],
    followUpQuestions: ["Give an example where == and === give different results"]
  }
];

const seedInterviewQuestions = async () => {
  try {
    await connectDB();

    // Delete existing interview questions
    await InterviewQuestion.deleteMany({});
    console.log('🗑️  Deleted existing interview questions');

    // Insert sample questions
    await InterviewQuestion.insertMany(sampleQuestions);
    console.log(`✅ Seeded ${sampleQuestions.length} interview questions successfully!`);

    // Show count by category
    const javaScriptCount = await InterviewQuestion.countDocuments({ category: 'javascript' });
    const pythonCount = await InterviewQuestion.countDocuments({ category: 'python' });
    const generalCount = await InterviewQuestion.countDocuments({ category: 'general' });

    console.log('\n📊 Questions by category:');
    console.log(`   JavaScript: ${javaScriptCount}`);
    console.log(`   Python: ${pythonCount}`);
    console.log(`   General: ${generalCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding interview questions:', error);
    process.exit(1);
  }
};

seedInterviewQuestions();