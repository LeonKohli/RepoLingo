import { defineEventHandler, readBody, createError } from 'h3'
import { Octokit } from '@octokit/rest'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { repoUrl, apiKey } = body

  try {
    const [owner, repo] = new URL(repoUrl).pathname.split('/').filter(Boolean)
    if (!owner || !repo) throw new Error('Invalid repository URL')

    const octokit = new Octokit({ auth: apiKey })
    console.log('Octokit instance created with API key:', apiKey)

    const { data: branchesData } = await octokit.repos.listBranches({ owner, repo })
    const branches = branchesData.map(branch => branch.name)

    return { branches }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})