const CookieUtils = {
    // Set a cookie with optional expiration and path
    set: (name, value, days = 7, path = '/') => {
      const expires = new Date(Date.now() + days * 86400000).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=Strict`;
    },
    
    // Get a cookie by name
    get: (name) => {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
          return decodeURIComponent(cookie.substring(name.length + 1));
        }
      }
      return null;
    },
    
    // Delete a cookie by setting expiration in the past
    delete: (name, path = '/') => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=Strict`;
    }
  };
  
  export default CookieUtils;