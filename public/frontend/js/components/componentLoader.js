class ComponentLoader {
  static async loadComponent(componentPath, targetSelector, data = {}) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${response.status} ${response.statusText}`);
      }
      
      let html = await response.text();
      
      if (data) {
        Object.keys(data).forEach(key => {
          const placeholder = new RegExp(`{{\s*${key}\s*}}`, 'g');
          html = html.replace(placeholder, data[key]);
        });
      }
      
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        targetElement.innerHTML = html;
        
        const scripts = targetElement.querySelectorAll('script');
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          Array.from(script.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = script.textContent;
          script.parentNode.replaceChild(newScript, script);
        });
        
        return true;
      } else {
        console.error(`Target element not found: ${targetSelector}`);
        return false;
      }
    } catch (error) {
      console.error('Error loading component:', error);
      return false;
    }
  }
}

window.ComponentLoader = ComponentLoader;