const escapeXml = str => str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]))

const escapeCDATA = (content) => {
  return content.replace(/]]>/g, ']]]]><![CDATA[>')
}

const formatXml = (contents, owner, repo, branch, includeTree) => {
  let treeStructure = ''
  if (includeTree) {
    const formattedTree = formatTree(contents)
      .split('\n')
      .map(line => '      ' + line)
      .join('\n')
    treeStructure = `
    <tree_structure>
      <![CDATA[
${formattedTree}
      ]]>
    </tree_structure>`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<llm_context>
  <repository>
    <metadata>
      <name>${escapeXml(owner)}/${escapeXml(repo)}</name>
      <description>Repository contents for LLM context</description>
      <fetch_date>${new Date().toISOString()}</fetch_date>
      <branch>${escapeXml(branch)}</branch>
    </metadata>${treeStructure}
    <contents>
${formatContents(contents, 3)}
    </contents>
  </repository>
</llm_context>`
}

const formatMarkdown = (contents, owner, repo, branch, includeTree) => {
  let output = `# ${owner}/${repo}\n\n`
  output += `Branch: ${branch}\n\n`

  if (includeTree) {
    output += "## Repository Structure\n\n```\n"
    output += formatTree(contents)
    output += "```\n\n"
  }

  output += "## File Contents\n\n"
  contents.forEach(item => {
    output += formatItemMarkdown(item, 0)
  })

  return output
}

const formatItemMarkdown = (item, depth) => {
  let output = ""
  const indent = "  ".repeat(depth)

  if (item.type === 'dir') {
    output += `${indent}- **${item.name}/**\n`
    item.contents.forEach(subItem => {
      output += formatItemMarkdown(subItem, depth + 1)
    })
  } else {
    output += `${indent}- \`${item.name}\`\n\n`
    output += "```\n"
    output += item.content
    output += "\n```\n\n"
  }

  return output
}

const formatPlaintext = (contents, owner, repo, branch, includeTree) => {
  let output = `Repository: ${owner}/${repo}\n`
  output += `Branch: ${branch}\n\n`

  if (includeTree) {
    output += "Repository Structure:\n\n"
    output += formatTree(contents)
    output += "\n\n"
  }

  output += "File Contents:\n\n"
  contents.forEach(item => {
    output += formatItemPlaintext(item, 0)
  })

  return output
}

const formatItemPlaintext = (item, depth) => {
  let output = ""
  const indent = "  ".repeat(depth)

  if (item.type === 'dir') {
    output += `${indent}${item.name}/\n`
    item.contents.forEach(subItem => {
      output += formatItemPlaintext(subItem, depth + 1)
    })
  } else {
    output += `${indent}${item.name}\n`
    output += "--------------------\n"
    output += item.content
    output += "\n--------------------\n\n"
  }

  return output
}

const formatTree = (contents, indent = 0) => {
  let tree = indent === 0 ? '.\n' : ''
  const lastIndex = contents.length - 1

  contents.forEach((item, index) => {
    const isLast = index === lastIndex
    const prefix = indent === 0 ? '' : isLast ? '└── ' : '├── '
    const ind = '    '.repeat(indent) + prefix

    if (item.type === 'dir') {
      tree += `${ind}${item.name}/\n`
      tree += formatTree(item.contents, indent + 1)
    } else {
      tree += `${ind}${item.name}\n`
    }
  })
  return tree
}

const formatContents = (items, indent) => items.map(item => {
  const ind = '  '.repeat(indent)
  if (item.type === 'dir') {
    return `${ind}<directory name="${escapeXml(item.name)}" path="${escapeXml(item.path)}">\n${formatContents(item.contents, indent + 1)}${ind}</directory>`
  } else {
    return `${ind}<file name="${escapeXml(item.name)}" path="${escapeXml(item.path)}">
${ind}  <content><![CDATA[
${item.content.split('\n').map(line => `${ind}    ${line}`).join('\n')}
${ind}  ]]></content>
${ind}</file>`
  }
}).join('\n')

export const formatOutput = (contents, owner, repo, branch, includeTree, format) => {
  switch (format) {
    case 'xml':
      return formatXml(contents, owner, repo, branch, includeTree)
    case 'markdown':
      return formatMarkdown(contents, owner, repo, branch, includeTree)
    case 'plaintext':
      return formatPlaintext(contents, owner, repo, branch, includeTree)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}