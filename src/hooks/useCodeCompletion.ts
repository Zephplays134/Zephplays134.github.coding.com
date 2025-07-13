import { useCallback } from 'react';

export const useCodeCompletion = () => {
  const getCompletion = useCallback((model: any, position: any): string | null => {
    const line = model.getLineContent(position.lineNumber).trim();

    // Mock JS/TS function completion
    if (line.startsWith('function') && !line.includes('{')) {
      const functionName = line.split(' ')[1]?.replace('()', '') || 'myFunction';
      return ` ${functionName}() {\n  // your code here\n}`;
    }

    // Mock console.log completion
    if (line.endsWith('console.log(')) {
      return `'Hello, World!');`;
    }

    // Mock React component return
    if (line.endsWith('return (')) {
        return `\n    <div>\n      \n    </div>\n  );`;
    }

    // Mock HTML tag closing
    if (line.match(/<([a-zA-Z0-9]+)>$/)) {
        const match = line.match(/<([a-zA-Z0-9]+)>$/);
        if (match) {
            const tagName = match[1];
            return `</${tagName}>`;
        }
    }

    // Mock CSS property completion
    if (line.endsWith(':')) {
        const prop = line.split(':')[0].trim();
        if (prop === 'display') return ' flex;';
        if (prop === 'color') return ' #';
        if (prop === 'background-color') return ' #';
    }

    return null;
  }, []);

  return { getCompletion };
};
