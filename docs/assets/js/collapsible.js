// Collapsible sections for Jouster documentation

class JousterCollapsible {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupCollapsibleSections();
    this.handleHashInUrl();
  }
  
  setupCollapsibleSections() {
    // Find all collapsible section headers
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    collapsibleHeaders.forEach(header => {
      // Create toggle icon
      const toggleIcon = document.createElement('span');
      toggleIcon.className = 'collapsible-toggle';
      toggleIcon.innerHTML = '<i class="fas fa-chevron-down"></i>';
      header.appendChild(toggleIcon);
      
      // Add click event
      header.addEventListener('click', () => {
        header.classList.toggle('active');
        
        // Toggle the content visibility
        const content = header.nextElementSibling;
        if (content && content.classList.contains('collapsible-content')) {
          if (content.style.maxHeight) {
            content.style.maxHeight = null;
            toggleIcon.innerHTML = '<i class="fas fa-chevron-down"></i>';
          } else {
            content.style.maxHeight = content.scrollHeight + "px";
            toggleIcon.innerHTML = '<i class="fas fa-chevron-up"></i>';
          }
        }
      });
    });
  }
  
  handleHashInUrl() {
    // Auto-expand sections if they have a hash in the URL
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Find the closest collapsible header
        let header = targetElement;
        while (header && !header.classList.contains('collapsible-header')) {
          header = header.previousElementSibling;
        }
        
        // Expand the section
        if (header && header.classList.contains('collapsible-header')) {
          header.click();
          
          // Scroll to the target element
          setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }
      }
    }
  }
}

// Initialize collapsible sections when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JousterCollapsible();
});
