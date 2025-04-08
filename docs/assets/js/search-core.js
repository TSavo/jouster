// Core search functionality for Jouster documentation

class JousterSearchCore {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.searchResults = document.getElementById('search-results');
    this.searchIndex = window.jousterSearchIndex || [];
    this.maxResults = 8;
    this.minQueryLength = 2;
  }
  
  search(query) {
    if (!query || query.length < this.minQueryLength) {
      return [];
    }
    
    query = query.toLowerCase().trim();
    
    return this.searchIndex
      .filter(item => {
        // Search in title, content, and tags
        return item.title.toLowerCase().includes(query) || 
               item.content.toLowerCase().includes(query) ||
               (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)));
      })
      .slice(0, this.maxResults);
  }
  
  highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<span class="search-result-highlight">$1</span>');
  }
  
  highlightTextInContent(text, query) {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
    
    // Find the position of the first match
    const matchIndex = text.toLowerCase().indexOf(query.toLowerCase());
    
    if (matchIndex === -1) {
      // If no match, return a truncated version of the text
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }
    
    // Calculate start and end positions for the excerpt
    const excerptStart = Math.max(0, matchIndex - 40);
    const excerptEnd = Math.min(text.length, excerptStart + 100);
    
    // Create the excerpt
    let excerpt = text.substring(excerptStart, excerptEnd);
    
    // Add ellipsis if needed
    if (excerptStart > 0) excerpt = '...' + excerpt;
    if (excerptEnd < text.length) excerpt = excerpt + '...';
    
    // Highlight the query in the excerpt
    return excerpt.replace(regex, '<span class="search-result-highlight">$1</span>');
  }
  
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Make the search core available globally
window.JousterSearchCore = JousterSearchCore;
