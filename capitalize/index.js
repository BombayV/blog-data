import fs from 'fs';
import fetch from 'node-fetch';

const api = 'https://random-word-api.herokuapp.com/word?length=5';

const fetchWord = async () => {
  const response = await fetch(api);
  const data = await response.json();
  return addToFile(data[0]);
}

const addToFile = (word) => {
  // Capitalize first letter
  const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
  fs.appendFile('words.txt', `"${capitalizedWord}",\n`, (err) => {
    if (err) throw err;
  });
  return capitalizedWord;
}

// Call the function until the program is stopped. Log the word to the console.
setInterval(() => {
  // Log the word to the console in yellow
  fetchWord().then(word => console.log('\x1b[33m%s\x1b[0m\'', `New Word: ${word} | Line Count: ${fs.readFileSync('words.txt').toString().split('\n').length}`));
}, 1500);

// Add a starting log to the console with green text.
console.log('\x1b[32m%s\x1b[0m', 'Starting...');