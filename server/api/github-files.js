import { defineEventHandler, readBody, createError } from 'h3';
import { Octokit } from '@octokit/rest';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { repoUrl, apiKey, selectedBranch } = body;

  try {
    const [owner, repo] = new URL(repoUrl).pathname.split('/').filter(Boolean);
    if (!owner || !repo) throw new Error('Invalid repository URL');

    const octokit = new Octokit({ auth: apiKey });

    const getTree = async (path = '') => {
      const { data } = await octokit.repos.getContent({ owner, repo, path, ref: selectedBranch });
      return Promise.all(
        data.map(async (item) => {
          if (item.type === 'dir') {
            return {
              name: item.name,
              path: item.path,
              type: 'dir',
              children: await getTree(item.path),
            };
          } else {
            return {
              name: item.name,
              path: item.path,
              type: 'file',
            };
          }
        })
      );
    };

    const tree = await getTree();

    return { tree };
  } catch (error) {
    console.error('Error in github-files.ts:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'An unexpected error occurred',
    });
  }
});
