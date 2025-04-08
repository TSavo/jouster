// Code highlighting for Jouster documentation

class JousterCodeHighlight {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupCodeBlocks();
  }
  
  setupCodeBlocks() {
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
}

// Initialize code highlighting when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JousterCodeHighlight();
});
