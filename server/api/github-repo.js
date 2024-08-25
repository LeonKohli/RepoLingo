import { defineEventHandler, readBody, createError } from 'h3'
import simpleGit from 'simple-git'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { $fetch } from 'ofetch'

const git = simpleGit()

const standardIgnorePatterns = [
  '.git', '.github', '.gitignore', '.gitattributes',
  'node_modules', 'venv', '__pycache__',
  '.DS_Store', 'Thumbs.db',
  '*.log', '*.tmp', '*.temp',
  '*.swp', '*.swo', '*.bak',
  'build', 'dist', 'out',
  'coverage', '.nyc_output',
  '.env', '.env.local', '.env.*.local'
]


const shouldIgnore = (path, gitignorePatterns, useGitignore, useStandardIgnore, customIgnore) => {
  const customPatterns = customIgnore.split('\n').map(p => p.trim()).filter(Boolean)
  const allPatterns = [
    ...(useGitignore ? gitignorePatterns : []),
    ...(useStandardIgnore ? standardIgnorePatterns.map(p => new RegExp(p.replace(/\*/g, '.*').replace(/\./g, '\\.'))) : []),
    ...customPatterns.map(p => new RegExp(p.replace(/\*/g, '.*').replace(/\./g, '\\.')))
  ]
  return allPatterns.some(pattern => pattern.test(path))
}

const getRepoInfo = async (owner, repo) => {
  const data = await $fetch(`https://api.github.com/repos/${owner}/${repo}`)
  return {
    defaultBranch: data.default_branch,
    branches: data.branches_url.replace('{/branch}', '')
  }
}

const getBranches = async (branchesUrl) => {
  const data = await $fetch(branchesUrl)
  return data.map(branch => branch.name)
}

const cloneRepo = async (repoUrl, branch) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-'))
  await git.clone(repoUrl, tempDir, ['--depth', '1', '--branch', branch])
  return tempDir
}

const fetchContents = async (repoPath, useGitignore, useStandardIgnore, customIgnore, fileSizeLimit, gitignorePatterns, currentPath = '') => {
  const contents = []
  const items = await fs.readdir(path.join(repoPath, currentPath), { withFileTypes: true })

  for (const item of items) {
    const itemPath = path.join(currentPath, item.name)
    
    if (shouldIgnore(itemPath, gitignorePatterns, useGitignore, useStandardIgnore, customIgnore)) continue

    if (item.isDirectory()) {
      contents.push({
        type: 'dir',
        name: item.name,
        path: itemPath,
        contents: await fetchContents(repoPath, useGitignore, useStandardIgnore, customIgnore, fileSizeLimit, gitignorePatterns, itemPath)
      })
    } else {
      const stats = await fs.stat(path.join(repoPath, itemPath))
      if (stats.size <= fileSizeLimit * 1024) {
        const content = await fs.readFile(path.join(repoPath, itemPath), 'utf-8')
        contents.push({ type: 'file', name: item.name, path: itemPath, content })
      }
    }
  }

  return contents
}

const formatXml = (contents, owner, repo, branch) => {
  const escape = str => str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]))
  const formatContents = (items, indent) => items.map(item => {
    const ind = '  '.repeat(indent)
    if (item.type === 'dir') {
      return `${ind}<directory name="${escape(item.name)}" path="${escape(item.path)}">\n${formatContents(item.contents, indent + 1)}${ind}</directory>`
    } else {
      return `${ind}<file name="${escape(item.name)}" path="${escape(item.path)}"><content><![CDATA[${item.content}]]></content></file>`
    }
  }).join('\n')

  return `<llm_context>
  <repository name="${escape(owner)}/${escape(repo)}">
    <metadata>
      <description>Repository contents for LLM context</description>
      <fetch_date>${new Date().toISOString()}</fetch_date>
      <branch>${escape(branch)}</branch>
    </metadata>
    <contents>
${formatContents(contents, 3)}
    </contents>
  </repository>
</llm_context>`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { repoUrl, useGitignore, useStandardIgnore, customIgnore, fileSizeLimit, selectedBranch } = body

  try {
    const [owner, repo] = new URL(repoUrl).pathname.split('/').filter(Boolean)
    if (!owner || !repo) throw new Error('Invalid repository URL')

    const repoInfo = await getRepoInfo(owner, repo)
    const branches = await getBranches(repoInfo.branches)
    
    const branchToUse = selectedBranch || repoInfo.defaultBranch
    if (!branches.includes(branchToUse)) {
      throw new Error(`Branch '${branchToUse}' not found. Available branches: ${branches.join(', ')}`)
    }

    const repoPath = await cloneRepo(`https://github.com/${owner}/${repo}.git`, branchToUse)

    let gitignorePatterns = []
    if (useGitignore) {
      try {
        const gitignoreContent = await fs.readFile(path.join(repoPath, '.gitignore'), 'utf-8')
        gitignorePatterns = gitignoreContent.split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => new RegExp(line.replace(/\*/g, '.*').replace(/\./g, '\\.')))
      } catch (error) {
        console.warn('No .gitignore file found or unable to read it')
      }
    }

    const contents = await fetchContents(repoPath, useGitignore, useStandardIgnore, customIgnore, fileSizeLimit, gitignorePatterns)

    const xmlContent = formatXml(contents, owner, repo, branchToUse)

    // Clean up: remove the temporary directory
    await fs.rm(repoPath, { recursive: true, force: true })

    return {
      xmlContent,
      repoInfo: `Repository: ${owner}/${repo} (Default branch: ${repoInfo.defaultBranch})`,
      rateLimitInfo: 'API Rate Limit: N/A (Using local Git operations)',
      branches
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})