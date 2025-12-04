import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Excel file
const filePath = path.join(__dirname, '../../CSBS Dept. Systems count details (1).xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log('Excel File Structure:');
    console.log('=====================');
    console.log('Total Rows:', data.length);
    console.log('\nFirst Row (Sample):');
    console.log(JSON.stringify(data[0], null, 2));
    console.log('\nAll Column Names:');
    if (data.length > 0) {
        console.log(Object.keys(data[0]));
    }

    // Save to file for easier viewing
    const outputPath = path.join(__dirname, 'lab-data-output.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\nData saved to: ${outputPath}`);
    console.log('SUCCESS: Excel data parsed successfully!');
} catch (error) {
    console.error('Error reading Excel file:', error.message);
}
