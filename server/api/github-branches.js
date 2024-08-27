import { defineEventHandler, readBody, createError } from 'h3'
import { getBranches } from '../utils/gitUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { repoUrl } = body

  try {
    const [owner, repo] = new URL(repoUrl).pathname.split('/').filter(Boolean)
    if (!owner || !repo) throw new Error('Invalid repository URL')

    const branches = await getBranches(`https://github.com/${owner}/${repo}.git`)

    return { branches }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})