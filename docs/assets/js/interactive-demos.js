// Interactive demos for Jouster documentation

class JousterDemos {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupDemos();
  }
  
  setupDemos() {
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
          this.runDemo(demoCode, demoResult);
        });
      }
    });
  }
  
  runDemo(codeElement, resultElement) {
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
}

// Initialize demos when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JousterDemos();
});
