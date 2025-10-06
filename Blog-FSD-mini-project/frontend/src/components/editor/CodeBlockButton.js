import React, { useState, useRef, useEffect } from 'react';
import { FiCode } from 'react-icons/fi';

const CodeBlockButton = () => {
  const [showLanguages, setShowLanguages] = useState(false);
  const dropdownRef = useRef(null);
  
  const languages = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'C++', value: 'cpp' },
    { label: 'HTML', value: 'html' },
    { label: 'CSS', value: 'css' },
    { label: 'SQL', value: 'sql' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Ruby', value: 'ruby' },
    { label: 'PHP', value: 'php' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguages(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertCodeBlock = (language) => {
    const quill = document.querySelector('.ql-editor');
    if (!quill) return;

    const range = window.getSelection().getRangeAt(0);
    const preElement = document.createElement('pre');
    const codeElement = document.createElement('code');
    
    codeElement.className = `language-${language}`;
    codeElement.textContent = '\n';
    
    preElement.appendChild(codeElement);
    range.deleteContents();
    range.insertNode(preElement);
    
    // Position cursor inside code block
    const selection = window.getSelection();
    const newRange = document.createRange();
    newRange.setStart(codeElement, 0);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    setShowLanguages(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="ql-code-block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        onClick={() => setShowLanguages(!showLanguages)}
        title="Insert Code Block"
      >
        <FiCode className="w-4 h-4" />
      </button>

      {showLanguages && (
        <div className="absolute z-50 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => insertCodeBlock(lang.value)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeBlockButton;