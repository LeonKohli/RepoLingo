const escape = str => str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]))

const escapeCDATA = (content) => {
  return content.replace(/]]>/g, ']]]]><![CDATA[>')
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
    return `${ind}<directory name="${escape(item.name)}" path="${escape(item.path)}">\n${formatContents(item.contents, indent + 1)}${ind}</directory>`
  } else {
    return `${ind}<file name="${escape(item.name)}" path="${escape(item.path)}">
${ind}  <content><![CDATA[${escapeCDATA(item.content)}]]></content>
${ind}</file>`
  }
}).join('\n')

export const formatXml = (contents, owner, repo, branch, includeTree) => {
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

  return `<llm_context>
  <repository>
    <metadata>
      <name>${escape(owner)}/${escape(repo)}</name>
      <description>Repository contents for LLM context</description>
      <fetch_date>${new Date().toISOString()}</fetch_date>
      <branch>${escape(branch)}</branch>
    </metadata>${treeStructure}
    <contents>
${formatContents(contents, 3)}
    </contents>
  </repository>
</llm_context>`
}