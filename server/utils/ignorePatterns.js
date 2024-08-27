import { isBinaryFile } from 'isbinaryfile'

export const standardIgnorePatterns = [
  '.git', '.github', '.gitignore', '.gitattributes',
  'node_modules', 'venv', '__pycache__',
  '.DS_Store', 'Thumbs.db',
  '*.log', '*.tmp', '*.temp',
  '*.swp', '*.swo', '*.bak',
  'build', 'dist', 'out',
  'coverage', '.nyc_output',
  '.env', '.env.local', '.env.*.local'
]

export const shouldIgnore = async (path, gitignorePatterns, useGitignore, useStandardIgnore, customIgnore, content) => {
  const customPatterns = customIgnore.split('\n').map(p => p.trim()).filter(Boolean)
  const allPatterns = [
    ...(useGitignore ? gitignorePatterns : []),
    ...(useStandardIgnore ? standardIgnorePatterns.map(p => new RegExp(p.replace(/\*/g, '.*').replace(/\./g, '\\.'))) : []),
    ...customPatterns.map(p => new RegExp(p.replace(/\*/g, '.*').replace(/\./g, '\\.')))
  ]

  // Check if the file matches any ignore pattern
  if (allPatterns.some(pattern => pattern.test(path))) {
    return true
  }

  // Check if the file is binary
  if (content) {
    try {
      const isBinary = await isBinaryFile(Buffer.from(content))
      if (isBinary) {
        return true
      }
    } catch (error) {
      console.warn(`Error checking if file is binary: ${path}`, error)
      // If we can't determine if it's binary, we'll assume it's not
    }
  }

  return false
}