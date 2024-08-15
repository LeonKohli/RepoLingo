import { defineEventHandler, readBody, createError } from 'h3'
import { Octokit } from '@octokit/rest'
import { isBinaryFile } from 'isbinaryfile'

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

const updateRateLimitInfo = (rateLimit) => {
  const { remaining, limit, reset } = rateLimit
  if (remaining && limit && reset) {
    const resetDate = new Date(reset * 1000).toLocaleTimeString()
    return `API Rate Limit: ${remaining}/${limit} | Resets at ${resetDate}`
  }
  return 'API Rate Limit: N/A'
}

const shouldIgnore = (path, gitignorePatterns, useGitignore, useStandardIgnore, customIgnore) => {
  const customPatterns = customIgnore.split('\n').map(p => p.trim()).filter(Boolean)
  const allPatterns = [
    ...(useGitignore ? gitignorePatterns : []),
    ...(useStandardIgnore ? standardIgnorePatterns.map(p => new RegExp(p.replace(/\*/g, '.*').replace(/\./g, '\\.'))) : []),
    ...customPatterns.map(p => new RegExp(p.replace(/\*/g, '.*').replace(/\./g, '\\.')))
  ]
  return allPatterns.some(pattern => pattern.test(path))
}

const fetchContents = async (octokit, owner, repo, branch, useGitignore, useStandardIgnore, customIgnore, fileSizeLimit, gitignorePatterns, path = '') => {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  })

  const contents = []
  const promises = []

  for (const item of Array.isArray(data) ? data : [data]) {
    if (shouldIgnore(item.path, gitignorePatterns, useGitignore, useStandardIgnore, customIgnore)) continue

    if (item.type === 'dir') {
      promises.push(
        fetchContents(octokit, owner, repo, branch, useGitignore, useStandardIgnore, customIgnore, fileSizeLimit, gitignorePatterns, item.path)
          .then(subContents => contents.push({ type: 'dir', name: item.name, path: item.path, contents: subContents }))
      )
    } else if (item.type === 'file') {
      if (item.size > fileSizeLimit * 1024) {
        console.warn(`Skipping ${item.path}: File size exceeds limit`)
        continue
      }
      promises.push(
        octokit.repos.getContent({
          owner,
          repo,
          path: item.path,
          ref: branch,
        }).then(async ({ data: fileContent }) => {
          const content = Buffer.from(fileContent.content, 'base64')
          
          if (await isBinaryFile(content)) {
            console.warn(`Skipping ${item.path}: Detected as binary file`)
            return
          }
          
          contents.push({ type: 'file', name: item.name, path: item.path, content: content.toString('utf-8') })
        })
      )
    }
  }

  await Promise.all(promises)
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
  const { repoUrl, apiKey, useGitignore, useStandardIgnore, customIgnore, fileSizeLimit, selectedBranch } = body

  const octokit = new Octokit({ auth: apiKey })

  try {
    const [owner, repo] = new URL(repoUrl).pathname.split('/').filter(Boolean)
    if (!owner || !repo) throw new Error('Invalid repository URL')

    const [repoInfo, branches] = await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.repos.listBranches({ owner, repo })
    ])

    const defaultBranch = repoInfo.data.default_branch
    const branch = selectedBranch || defaultBranch

    let gitignorePatterns = []
    if (useGitignore) {
      try {
        const { data: gitignoreFile } = await octokit.repos.getContent({
          owner,
          repo,
          path: '.gitignore',
          ref: branch,
        })
        const content = Buffer.from(gitignoreFile.content, 'base64').toString('utf-8')
        gitignorePatterns = content.split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => new RegExp(line.replace(/\*/g, '.*').replace(/\./g, '\\.')))
      } catch (error) {
        console.warn('No .gitignore file found or unable to fetch it')
      }
    }

    const [contents, rateLimit] = await Promise.all([
      fetchContents(octokit, owner, repo, branch, useGitignore, useStandardIgnore, customIgnore, fileSizeLimit, gitignorePatterns),
      octokit.rateLimit.get()
    ])

    const xmlContent = formatXml(contents, owner, repo, branch)

    return {
      xmlContent,
      repoInfo: `Repository: ${owner}/${repo} (Default branch: ${defaultBranch})`,
      rateLimitInfo: updateRateLimitInfo(rateLimit.data.resources.core),
      branches: branches.data.map(b => b.name)
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})