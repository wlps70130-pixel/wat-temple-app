import Papa from 'papaparse';

const csvData = `categoryId,title,subtitle,duration,url
tripitaka,,พระไตรปิฎก,,
tripitaka,,พระไตรปิฎก,,
luangpu,วิธีเจริญภาวนาเบื้องต้น,พระมงคลเทพมุนี,16.08,https://...
,,,,,
shortRow
`;

Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
        results.data.forEach((row, i) => {
            try {
                const catKey = Object.keys(row).find(k => k.replace(/^\uFEFF/, '').trim() === 'categoryId');
                const urlKey = Object.keys(row).find(k => k.trim() === 'url');
                
                console.log(`Row ${i}:`, row);
                if (!catKey || !urlKey) {
                    console.log(`Row ${i}: Missing keys`);
                    return;
                }
                
                const catVal = row[catKey] ? row[catKey].trim() : "undefined";
                const urlVal = row[urlKey] ? row[urlKey].trim() : "undefined";
                console.log(`Row ${i} values -> cat: ${catVal}, url: ${urlVal}`);
                
                // Simulate the failing line:
                const isMatch = row[catKey].trim() === 'luangpu' && row[urlKey].trim() !== '';
                console.log(`Row ${i} match: ${isMatch}`);
            } catch (e) {
                console.error(`Row ${i} crashed:`, e.message);
            }
        });
    }
});
