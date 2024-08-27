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

export const shouldIgnore = (path, gitignorePatterns, useGitignore, useStandardIgnore, customIgnore) => {
  const customPatterns = customIgnore.split('\n').map(p => p.trim()).filter(Boolean)
  const allPatterns = [
    ...(useGitignore ? gitignorePatterns : []),
    ...(useStandardIgnore ? standardIgnorePatterns.map(p => new RegExp(p.replace(/\*/g, '.*').replace(/\./g, '\\.'))) : []),
    ...customPatterns.map(p => new RegExp(p.replace(/\*/g, '.*').replace(/\./g, '\\.')))
  ]
  return allPatterns.some(pattern => pattern.test(path))
}