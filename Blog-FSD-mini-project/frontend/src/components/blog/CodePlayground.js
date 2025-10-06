import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiSquare, FiCopy, FiX, FiDownload, FiUpload } from 'react-icons/fi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodePlayground = ({ codeBlock, onClose }) => {
  const [code, setCode] = useState(codeBlock?.code || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [executionTime, setExecutionTime] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const outputRef = useRef(null);

  useEffect(() => {
    if (codeBlock) {
      setCode(codeBlock.code);
      setOutput('');
      setError('');
      setExecutionTime(0);
      setShowOutput(false);
    }
  }, [codeBlock]);

  const runCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to run');
      return;
    }

    setIsRunning(true);
    setError('');
    setOutput('');
    setShowOutput(true);

    let originalLog;
    let originalError;
    let originalWarn;

    try {
      const startTime = performance.now();
      
      // Simple console capture
      const logs = [];
      originalLog = console.log;
      originalError = console.error;
      originalWarn = console.warn;
      
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      
      console.error = (...args) => {
        logs.push('ERROR: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      
      console.warn = (...args) => {
        logs.push('WARN: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      // Execute code safely
      const func = new Function(code);
      await func();
      
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      
      setOutput(logs.join('\n'));

      const endTime = performance.now();
      setExecutionTime(endTime - startTime);

      // Restore console methods in case of error
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      
      if (logs.length === 0) {
        setOutput('Code executed successfully with no output.\n');
      }
    } catch (err) {
      // Restore console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      
      setError(err.message);
      setOutput('ERROR: ' + err.message + '\n');
    } finally {
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    setIsRunning(false);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy output:', err);
    }
  };

  const clearOutput = () => {
    setOutput('');
    setError('');
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (showOutput && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, showOutput]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Code Playground - {codeBlock?.language || 'JavaScript'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
            {/* Code Editor */}
            <div className="flex-1 p-6 border-r border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Code Editor
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCode}
                    className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                    title="Copy code"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={downloadCode}
                    className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                    title="Download code"
                  >
                    <FiDownload className="w-4 h-4" />
                  </button>
                  <label className="p-2 text-gray-400 hover:text-primary-500 transition-colors cursor-pointer" title="Upload code">
                    <FiUpload className="w-4 h-4" />
                    <input
                      type="file"
                      accept=".js,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  language="javascript"
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    minHeight: '400px'
                  }}
                  showLineNumbers
                  wrapLines
                >
                  {code}
                </SyntaxHighlighter>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={isRunning ? stopExecution : runCode}
                  disabled={!code.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isRunning
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRunning ? (
                    <>
                      <FiSquare className="w-4 h-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <FiPlay className="w-4 h-4" />
                      Run Code
                    </>
                  )}
                </button>

                <button
                  onClick={clearOutput}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Clear Output
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Output
                </h3>
                <div className="flex items-center gap-2">
                  {executionTime > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Execution time: {executionTime.toFixed(2)}ms
                    </span>
                  )}
                  <button
                    onClick={copyOutput}
                    className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                    title="Copy output"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-auto">
                <pre
                  ref={outputRef}
                  className="text-green-400 font-mono text-sm whitespace-pre-wrap"
                >
                  {output || 'Output will appear here...'}
                </pre>
                {error && (
                  <div className="text-red-400 mt-2">
                    <strong>Error:</strong> {error}
                  </div>
                )}
              </div>

              {/* Sample Code Examples */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Quick Examples
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      title: 'Hello World',
                      code: 'console.log("Hello, World!");'
                    },
                    {
                      title: 'Array Operations',
                      code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Original:', numbers);
console.log('Doubled:', doubled);`
                    },
                    {
                      title: 'Async Function',
                      code: `async function fetchData() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
  const data = await response.json();
  console.log('Fetched data:', data);
}
fetchData();`
                    },
                    {
                      title: 'Class Example',
                      code: `class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    console.log(\`Hello, I'm \${this.name} and I'm \${this.age} years old.\`);
  }
}

const person = new Person('John', 30);
person.greet();`
                    }
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setCode(example.code)}
                      className="p-3 text-left bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {example.title}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                        {example.code}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CodePlayground;
