

fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pubhtml')
  .then(r => r.text())
  .then(t => {
    const regex = /name:\s*"([^"]+)"[^}]+?gid:\s*"(\d+)"/g;
    let match;
    while ((match = regex.exec(t)) !== null) {
      console.log(`${match[1]} -> ${match[2]}`);
    }
    
    // Also try without quotes for gid
    const regex2 = /name:\s*"([^"]+)"[^}]+?gid:\s*(\d+)/g;
    let match2;
    while ((match2 = regex2.exec(t)) !== null) {
      console.log(`${match2[1]} -> ${match2[2]}`);
    }
  });
