// Search UI handler for Jouster documentation

class JousterSearchUI {
  constructor() {
    this.searchCore = new JousterSearchCore();
    this.searchInput = document.getElementById('search-input');
    this.searchResults = document.getElementById('search-results');
    this.searchOverlay = document.getElementById('search-overlay');
    
    this.init();
  }
  
  init() {
    // Create search overlay if it doesn't exist
    if (!this.searchOverlay) {
      this.searchOverlay = document.createElement('div');
      this.searchOverlay.id = 'search-overlay';
      this.searchOverlay.className = 'search-overlay';
      document.body.appendChild(this.searchOverlay);
    }
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Search input event
    this.searchInput.addEventListener('input', this.debounce(() => {
      this.handleSearch();
    }, 300));
    
    // Focus event to show results if there's a query
    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.trim().length >= this.searchCore.minQueryLength) {
        this.showResults();
      }
    });
    
    // Click outside to close results
    document.addEventListener('click', (e) => {
      if (!this.searchInput.contains(e.target) && 
          !this.searchResults.contains(e.target)) {
        this.hideResults();
      }
    });
    
    // Keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideResults();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.focusNextResult();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.focusPreviousResult();
      } else if (e.key === 'Enter') {
        const focusedItem = this.searchResults.querySelector('.search-result-item:focus');
        if (focusedItem) {
          const link = focusedItem.querySelector('a');
          if (link) {
            link.click();
          }
        }
      }
    });
    
    // Overlay click to close results
    this.searchOverlay.addEventListener('click', () => {
      this.hideResults();
    });
  }
  
  handleSearch() {
    const query = this.searchInput.value.trim();
    
    if (query.length < this.searchCore.minQueryLength) {
      this.hideResults();
      return;
    }
    
    const results = this.searchCore.search(query);
    this.displayResults(results, query);
  }
  
  displayResults(results, query) {
    if (!this.searchResults) return;
    
    if (results.length > 0) {
      const resultsHtml = results.map(result => {
        // Highlight matches in title and content
        const highlightedTitle = this.searchCore.highlightText(result.title, query);
        const highlightedContent = this.searchCore.highlightTextInContent(result.content, query);
        
        // Create tag elements
        const tagsHtml = result.tags ? 
          `<div class="search-result-tags">
            ${result.tags.map(tag => `<span class="search-result-tag">${tag}</span>`).join('')}
          </div>` : '';
        
        return `
          <li class="search-result-item" tabindex="0">
            <a href="${result.url}">
              <h4 class="search-result-title">${highlightedTitle}</h4>
              <p class="search-result-content">${highlightedContent}</p>
              ${tagsHtml}
            </a>
          </li>
        `;
      }).join('');
      
      this.searchResults.innerHTML = `<ul class="search-results-list">${resultsHtml}</ul>`;
    } else {
      this.searchResults.innerHTML = '<div class="no-results">No results found</div>';
    }
    
    this.showResults();
  }
  
  showResults() {
    this.searchResults.classList.add('active');
    this.searchOverlay.classList.add('active');
  }
  
  hideResults() {
    this.searchResults.classList.remove('active');
    this.searchOverlay.classList.remove('active');
  }
  
  focusNextResult() {
    const items = this.searchResults.querySelectorAll('.search-result-item');
    const focused = this.searchResults.querySelector('.search-result-item:focus');
    
    if (!focused && items.length > 0) {
      // Focus the first item if none is focused
      items[0].focus();
    } else if (focused) {
      // Find the index of the currently focused item
      const currentIndex = Array.from(items).indexOf(focused);
      
      // Focus the next item, or the first if at the end
      if (currentIndex < items.length - 1) {
        items[currentIndex + 1].focus();
      } else {
        items[0].focus();
      }
    }
  }
  
  focusPreviousResult() {
    const items = this.searchResults.querySelectorAll('.search-result-item');
    const focused = this.searchResults.querySelector('.search-result-item:focus');
    
    if (!focused && items.length > 0) {
      // Focus the last item if none is focused
      items[items.length - 1].focus();
    } else if (focused) {
      // Find the index of the currently focused item
      const currentIndex = Array.from(items).indexOf(focused);
      
      // Focus the previous item, or the last if at the beginning
      if (currentIndex > 0) {
        items[currentIndex - 1].focus();
      } else {
        items[items.length - 1].focus();
      }
    }
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize search UI when the DOM is loaded and search core is available
document.addEventListener('DOMContentLoaded', () => {
  if (window.JousterSearchCore) {
    new JousterSearchUI();
  } else {
    console.error('JousterSearchCore not found. Make sure search-core.js is loaded before search-ui.js.');
  }
});
