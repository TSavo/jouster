// Main JavaScript for Jouster documentation

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all features
  initCollapsibleSections();
  initDarkModeToggle();
  initSearch();
  
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

// Collapsible sections
function initCollapsibleSections() {
  // Add toggle functionality to section headers
  const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
  
  collapsibleHeaders.forEach(header => {
    header.addEventListener('click', function() {
      this.classList.toggle('active');
      
      // Toggle the content visibility
      const content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
  
  // Initialize nav section collapsible behavior
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
