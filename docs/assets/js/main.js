// Main JavaScript for Jouster documentation

document.addEventListener('DOMContentLoaded', function() {
  // Load Prism.js for syntax highlighting
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.min.js');
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-javascript.min.js');
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-typescript.min.js');
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-bash.min.js');
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-json.min.js');

  // Initialize all features
  // Note: collapsible sections are initialized by collapsible.js
  initNavSectionCollapsible();
  initDarkModeToggle();
  initSearch();
  initCodeHighlighting();
  initInteractiveDemos();

  // Add smooth scrolling to all links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
});

// Helper function to load scripts
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Initialize nav section collapsible behavior
function initNavSectionCollapsible() {
  const navSectionTitles = document.querySelectorAll('.nav-section-title');

  navSectionTitles.forEach(title => {
    title.addEventListener('click', function() {
      this.classList.toggle('collapsed');
      const navList = this.nextElementSibling;
      navList.classList.toggle('collapsed');
    });
  });
}

// Dark mode toggle
function initDarkModeToggle() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  // Check for saved theme preference or use the system preference
  const currentTheme = localStorage.getItem('theme') ||
                      (prefersDarkScheme.matches ? 'dark' : 'light');

  // Set initial theme
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (darkModeToggle) {
      darkModeToggle.checked = true;
    }
  }

  // Add toggle event listener
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    });
  }
}

// Search functionality
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  if (!searchInput || !searchResults) return;

  // Load the search index
  fetch('/jouster/assets/js/search-index.json')
    .then(response => response.json())
    .then(searchIndex => {
      searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();

        // Clear results if query is empty
        if (!query) {
          searchResults.innerHTML = '';
          searchResults.style.display = 'none';
          return;
        }

        // Filter the search index
        const results = searchIndex.filter(item => {
          return item.title.toLowerCase().includes(query) ||
                 item.content.toLowerCase().includes(query);
        }).slice(0, 10); // Limit to 10 results

        // Display results
        if (results.length > 0) {
          searchResults.innerHTML = results.map(result => `
            <li>
              <a href="${result.url}">
                <h4>${result.title}</h4>
                <p>${highlightText(result.content, query)}</p>
              </a>
            </li>
          `).join('');
          searchResults.style.display = 'block';
        } else {
          searchResults.innerHTML = '<li class="no-results">No results found</li>';
          searchResults.style.display = 'block';
        }
      });

      // Hide results when clicking outside
      document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
          searchResults.style.display = 'none';
        }
      });
    })
    .catch(error => {
      console.error('Error loading search index:', error);
    });
}

// Helper function to highlight search terms in text
function highlightText(text, query) {
  // Truncate text to show relevant part
  const maxLength = 150;
  let startPos = text.toLowerCase().indexOf(query);

  if (startPos === -1) startPos = 0;

  // Get a window of text around the match
  let start = Math.max(0, startPos - 60);
  let end = Math.min(text.length, start + maxLength);

  // Add ellipsis if needed
  let excerpt = text.substring(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';

  // Highlight the query
  return excerpt.replace(new RegExp(query, 'gi'), match => `<mark>${match}</mark>`);
}

// Code highlighting
function initCodeHighlighting() {
  // Find all code blocks
  const codeBlocks = document.querySelectorAll('pre code');

  codeBlocks.forEach(codeBlock => {
    // Add copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    copyButton.title = 'Copy to clipboard';

    // Wrap the code block in a container
    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-container';

    // Get the parent pre element
    const preElement = codeBlock.parentNode;

    // Insert the container before the pre element
    preElement.parentNode.insertBefore(codeContainer, preElement);

    // Move the pre element into the container
    codeContainer.appendChild(preElement);

    // Add the copy button to the container
    codeContainer.appendChild(copyButton);

    // Add click event to copy button
    copyButton.addEventListener('click', () => {
      const code = codeBlock.textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyButton.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
      }).catch(err => {
        console.error('Could not copy text: ', err);
        copyButton.innerHTML = '<i class="fas fa-times"></i>';
        setTimeout(() => {
          copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
      });
    });

    // Add syntax highlighting classes based on language
    const language = codeBlock.className.match(/language-(\w+)/);
    if (language) {
      codeBlock.classList.add(`language-${language[1]}`);

      // Add language label
      const languageLabel = document.createElement('div');
      languageLabel.className = 'code-language';
      languageLabel.textContent = language[1];
      codeContainer.appendChild(languageLabel);
    }
  });
}

// Interactive demos
function initInteractiveDemos() {
  // Find all demo containers
  const demoContainers = document.querySelectorAll('.demo-container');

  demoContainers.forEach(container => {
    // Get the demo code and result elements
    const demoCode = container.querySelector('.demo-code');
    const demoResult = container.querySelector('.demo-result');

    if (demoCode && demoResult) {
      // Add run button
      const runButton = document.createElement('button');
      runButton.className = 'run-button';
      runButton.innerHTML = '<i class="fas fa-play"></i> Run';
      container.insertBefore(runButton, demoResult);

      // Add click event to run button
      runButton.addEventListener('click', () => {
        runDemo(demoCode, demoResult);
      });
    }
  });
}

// Run a demo
function runDemo(codeElement, resultElement) {
  try {
    // Get the code
    const code = codeElement.textContent;

    // Create a sandbox
    const sandbox = document.createElement('iframe');
    sandbox.style.display = 'none';
    document.body.appendChild(sandbox);

    // Create a script element
    const script = sandbox.contentDocument.createElement('script');
    script.textContent = `
      try {
        const result = (function() {
          ${code}
        })();
        window.parent.postMessage({ type: 'demo-result', result: JSON.stringify(result) }, '*');
      } catch (error) {
        window.parent.postMessage({ type: 'demo-error', error: error.message }, '*');
      }
    `;

    // Add event listener for messages
    const messageHandler = (event) => {
      if (event.data.type === 'demo-result') {
        resultElement.innerHTML = `<div class="demo-success">Result: ${event.data.result}</div>`;
        window.removeEventListener('message', messageHandler);
        document.body.removeChild(sandbox);
      } else if (event.data.type === 'demo-error') {
        resultElement.innerHTML = `<div class="demo-error">Error: ${event.data.error}</div>`;
        window.removeEventListener('message', messageHandler);
        document.body.removeChild(sandbox);
      }
    };

    window.addEventListener('message', messageHandler);

    // Add the script to the sandbox
    sandbox.contentDocument.body.appendChild(script);
  } catch (error) {
    resultElement.innerHTML = `<div class="demo-error">Error: ${error.message}</div>`;
  }
}
