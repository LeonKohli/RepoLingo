import simpleGit from 'simple-git'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const git = simpleGit()

export const cloneRepo = async (repoUrl, branch) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-'))
  try {
    await git.clone(repoUrl, tempDir, ['--no-single-branch'])
    const localGit = simpleGit(tempDir)
    await localGit.checkout(branch)
  } catch (error) {
    if (error.message.includes('couldn\'t find remote ref')) {
      console.warn(`Branch '${branch}' not found. Falling back to default branch.`)
      await localGit.checkout('HEAD')
    } else {
      throw error
    }
  }
  return tempDir
}

export const getRepoInfo = async (repoPath) => {
  const git = simpleGit(repoPath)
  const branches = await git.branch()
  return {
    defaultBranch: branches.current,
    branches: branches.all
  }
}

export const getGitignorePatterns = async (repoPath) => {
  try {
    const gitignoreContent = await fs.readFile(path.join(repoPath, '.gitignore'), 'utf-8')
    return gitignoreContent.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => new RegExp(line.replace(/\*/g, '.*').replace(/\./g, '\\.')))
  } catch (error) {
    console.warn('No .gitignore file found or unable to read it')
    return []
  }
}

export const getBranches = async (repoUrl) => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-'))
    try {
      await git.clone(repoUrl, tempDir, ['--bare', '--no-single-branch'])
      const localGit = simpleGit(tempDir)
      const branches = await localGit.branch()
      return branches.all
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true })
    }
  }