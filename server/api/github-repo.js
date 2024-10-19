import { defineEventHandler, readBody, createError } from 'h3';
import { Octokit } from '@octokit/rest';
import { shouldIgnore } from '../utils/ignorePatterns';
import { formatOutput } from '../utils/formatter';

const shouldTraverse = (path, selectedFiles) => {
  if (selectedFiles.includes('*')) return true;
  return selectedFiles.some((selectedPath) => selectedPath.startsWith(`${path}/`) || selectedPath === path);
};

const shouldIncludeFile = (path, selectedFiles) => {
  if (selectedFiles.includes('*')) return true;
  return selectedFiles.includes(path);
};

const fetchContents = async (
  octokit,
  owner,
  repo,
  branch,
  path,
  useGitignore,
  useStandardIgnore,
  customIgnore,
  fileSizeLimit,
  gitignorePatterns,
  selectedFiles
) => {
  const { data } = await octokit.repos.getContent({ owner, repo, path, ref: branch });
  const items = Array.isArray(data) ? data : [data]; // Ensure data is an array
  const contents = [];

  for (const item of items) {
    if (item.type === 'dir') {
      if (!shouldTraverse(item.path, selectedFiles)) continue;

      const dirContents = await fetchContents(
        octokit,
        owner,
        repo,
        branch,
        item.path,
        useGitignore,
        useStandardIgnore,
        customIgnore,
        fileSizeLimit,
        gitignorePatterns,
        selectedFiles
      );

      if (dirContents.length > 0) {
        contents.push({
          type: 'dir',
          name: item.name,
          path: item.path,
          contents: dirContents,
        });
      }
    } else if (item.type === 'file') {
      if (!shouldIncludeFile(item.path, selectedFiles)) continue;

      if (item.size <= fileSizeLimit * 1024) {
        const fileContent = await octokit.repos.getContent({ owner, repo, path: item.path, ref: branch });
        const content = Buffer.from(fileContent.data.content, 'base64').toString('utf-8');
        const shouldBeIgnored = await shouldIgnore(
          item.path,
          gitignorePatterns,
          useGitignore,
          useStandardIgnore,
          customIgnore,
          content
        );
        if (!shouldBeIgnored) {
          contents.push({ type: 'file', name: item.name, path: item.path, content });
        }
      }
    }
  }

  return contents;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    repoUrl,
    apiKey,
    useGitignore,
    useStandardIgnore,
    customIgnore,
    fileSizeLimit,
    selectedBranch,
    includeTree,
    format,
    selectedFiles,
  } = body;

  try {
    // Validate the repository URL
    if (!repoUrl) {
      throw new Error('Repository URL is required');
    }

    let url;
    try {
      url = new URL(repoUrl);
    } catch (error) {
      throw new Error('Invalid repository URL format');
    }

    if (url.hostname !== 'github.com') {
      throw new Error('URL must be a GitHub repository');
    }

    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub repository URL');
    }

    const [owner, repo] = pathParts;
    const octokit = new Octokit({ auth: apiKey });

    // Fetch repository information
    let repoData;
    try {
      const { data } = await octokit.repos.get({ owner, repo });
      repoData = data;
    } catch (error) {
      if (error.status === 404) {
        throw new Error(
          'Repository not found. Please check the URL and ensure you have access to this repository.'
        );
      }
      throw error;
    }

    // Fetch branches
    const { data: branchesData } = await octokit.repos.listBranches({ owner, repo });
    const branches = branchesData.map((branch) => branch.name);

    // Validate selected branch
    const branchToUse = selectedBranch || repoData.default_branch;
    if (!branches.includes(branchToUse)) {
      throw new Error(`Branch "${branchToUse}" not found in the repository`);
    }

    // Fetch .gitignore patterns
    let gitignorePatterns = [];
    if (useGitignore) {
      try {
        const { data: gitignoreFile } = await octokit.repos.getContent({
          owner,
          repo,
          path: '.gitignore',
          ref: branchToUse,
        });
        const gitignoreContent = Buffer.from(gitignoreFile.content, 'base64').toString('utf-8');
        gitignorePatterns = gitignoreContent
          .split('\n')
          .filter((line) => line.trim() && !line.startsWith('#'))
          .map((line) => new RegExp(line.replace(/\*/g, '.*').replace(/\./g, '\\.')));
      } catch (error) {
        console.warn('No .gitignore file found or unable to read it');
      }
    }

    // Fetch contents
    const contents = await fetchContents(
      octokit,
      owner,
      repo,
      branchToUse,
      '',
      useGitignore,
      useStandardIgnore,
      customIgnore,
      fileSizeLimit,
      gitignorePatterns,
      selectedFiles
    );
    const output = formatOutput(contents, owner, repo, branchToUse, includeTree, format);

    // Fetch rate limit information
    const { data: rateLimit } = await octokit.rateLimit.get();

    return {
      output,
      repoInfo: `Repository: ${owner}/${repo} (Default branch: ${repoData.default_branch})`,
      rateLimitInfo: `API Rate Limit: ${rateLimit.rate.remaining}/${rateLimit.rate.limit} (Resets at ${new Date(
        rateLimit.rate.reset * 1000
      ).toLocaleString()})`,
      branches,
    };
  } catch (error) {
    console.error('Error in github-repo.ts:', error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || 'An unexpected error occurred',
    });
  }
});
