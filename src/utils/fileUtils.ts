export const getLanguageFromFilename = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase()
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sql': 'sql',
    'sh': 'shell',
    'bash': 'shell',
  }
  return languageMap[extension || ''] || 'plaintext'
}

export const getDefaultContent = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  const templates: { [key: string]: string } = {
    'js': '// JavaScript file\nconsole.log("Hello, World!");\n',
    'jsx': 'import React from "react";\n\nconst Component = () => {\n  return <div>Hello, World!</div>;\n};\n\nexport default Component;\n',
    'ts': '// TypeScript file\nconst message: string = "Hello, World!";\nconsole.log(message);\n',
    'tsx': 'import React from "react";\n\ninterface Props {}\n\nconst Component: React.FC<Props> = () => {\n  return <div>Hello, World!</div>;\n};\n\nexport default Component;\n',
    'py': '# Python file\nprint("Hello, World!")\n',
    'css': '/* CSS file */\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 0;\n}\n',
    'html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>\n',
    'md': '# Title\n\nHello, World!\n\n## Section\n\nContent goes here...\n',
    'json': '{\n  "name": "example",\n  "version": "1.0.0",\n  "description": "Example JSON file"\n}\n'
  }

  return templates[extension || ''] || '// New file\n'
}
