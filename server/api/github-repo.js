import { defineEventHandler, readBody, createError } from 'h3'
import fs from 'fs/promises'
import path from 'path'
import { isBinaryFile } from 'isbinaryfile'

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
      const fullPath = path.join(repoPath, itemPath)
      const stats = await fs.stat(fullPath)
      if (stats.size <= fileSizeLimit * 1024) {
        if (await isBinaryFile(fullPath)) {
          console.warn(`Skipping binary file: ${itemPath}`)
          continue
        }
        const content = await fs.readFile(fullPath, 'utf-8')
        contents.push({ type: 'file', name: item.name, path: itemPath, content })
      }
    }
  }

  return contents
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { repoUrl, useGitignore, useStandardIgnore, customIgnore, fileSizeLimit, selectedBranch, includeTree } = body

  try {
    const [owner, repo] = new URL(repoUrl).pathname.split('/').filter(Boolean)
    if (!owner || !repo) throw new Error('Invalid repository URL')

    const repoPath = await cloneRepo(`https://github.com/${owner}/${repo}.git`, selectedBranch || 'HEAD')
    const repoInfo = await getRepoInfo(repoPath)
    
    const branchToUse = selectedBranch || repoInfo.defaultBranch
    if (!repoInfo.branches.includes(branchToUse)) {
      console.warn(`Branch '${branchToUse}' not found. Using current branch: ${repoInfo.current}`)
    }

    const gitignorePatterns = useGitignore ? await getGitignorePatterns(repoPath) : []

    const contents = await fetchContents(repoPath, useGitignore, useStandardIgnore, customIgnore, fileSizeLimit, gitignorePatterns)

    const xmlContent = formatXml(contents, owner, repo, branchToUse, includeTree)

    // Clean up: remove the temporary directory
    await fs.rm(repoPath, { recursive: true, force: true })

    return {
      xmlContent,
      repoInfo: `Repository: ${owner}/${repo} (Default branch: ${repoInfo.defaultBranch})`,
      rateLimitInfo: 'API Rate Limit: N/A (Using local Git operations)',
      branches: repoInfo.branches
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})