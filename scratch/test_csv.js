import Papa from 'papaparse';
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPZers8pjFy5zTEaUJlKc0-uG3o0DHxWsHhxI91Q4ZUMkhNAXCiURxF1jNEdgycnXEvB-y_QZIAfCY/pub?gid=29969163&single=true&output=csv';

Papa.parse(SHEET_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
        console.log("Parsed keys of first row:", Object.keys(results.data[0]));
        const row = results.data[2]; // one of the luangpu rows
        console.log("Row:", row);
        
        const catKey = Object.keys(row).find(k => k.replace(/^\uFEFF/, '').trim() === 'categoryId');
        const urlKey = Object.keys(row).find(k => k.trim() === 'url');
        
        console.log("catKey:", catKey, "urlKey:", urlKey);
        
        if (!catKey || !urlKey) {
            console.log("FAILED to find keys");
        } else {
            console.log("cat value:", row[catKey].trim(), "url value:", row[urlKey].trim());
        }
    },
    error: (err) => console.error(err)
});
