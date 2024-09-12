# RepoLingo

### Turn any GitHub Repository into LLM-ready data
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/leonkohli/github-to-llm-context-converter.svg)](https://github.com/leonkohli/RepoLingo/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/leonkohli/github-to-llm-context-converter.svg)](https://github.com/leonkohli/RepoLingo/network)
[![GitHub issues](https://img.shields.io/github/issues/leonkohli/github-to-llm-context-converter.svg)](https://github.com/leonkohli/RepoLingo/issues)


RepoLingo transforms entire GitHub repositories into clean, LLM-ready structured XML data. Convert, analyze, and extract code repositories with a single Application. Ideal for AI companies looking to empower their LLM applications with comprehensive code context and project information.

### Features

- Fetch and parse GitHub repository contents
- Convert repository structure to XML format
- Customizable ignore patterns
- Support for .gitignore files
- Standard ignore patterns for common files and directories
- Copy to clipboard and download functionality
- Responsive design for mobile and desktop
- Branch selection
- File size limit setting
- Optional tree structure inclusion
- GitHub API key integration for higher rate limits
- Toast notifications for user feedback
- Dark mode support

### FAQ

**What repositories work?**
RepoLingo is best suited for software projects, documentation repositories, and open-source codebases. We currently support most programming languages and project structures commonly found on GitHub.

**Who can benefit from using RepoLingo?**
RepoLingo is tailored for LLM engineers, AI researchers, software developers, and data scientists looking to harness code repository data for training machine learning models, code analysis, project understanding, and more. It simplifies the process of converting complex repository structures into LLM-friendly formats, allowing professionals to focus on insights, model development, and effective communication with AI assistants about their projects.

### Demo

[Live Demo](https://repolingo.leonkohli.dev/)

### Tech Stack

- [Nuxt.js 3](https://nuxt.com/) - Vue.js framework
- [Vue.js 3](https://vuejs.org/) - Progressive JavaScript framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Octokit](https://github.com/octokit/rest.js/) - GitHub API client
- [highlight.js](https://highlightjs.org/) - Syntax highlighting
- [gpt-tokenizer](https://github.com/latitudegames/gpt-tokenizer) - Token counting

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/leonkohli/github-to-llm-context-converter.git
   ```

2. Navigate to the project directory:
   ```bash
   cd github-to-llm-context-converter
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your web browser.

### Usage

1. Enter a GitHub repository URL in the input field.
2. Select a branch (optional).
3. Adjust the settings as needed:
   - Toggle the use of .gitignore files
   - Toggle the use of standard ignore patterns
   - Add custom ignore patterns
   - Set file size limit
   - Choose to include tree structure
4. Click the "Fetch Repository" button to fetch and convert the repository.
5. Use the "Copy" or "Download" buttons to save the generated XML.

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
