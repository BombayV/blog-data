import fs from 'fs';
import fetch from 'node-fetch';
import prompts from 'prompts';

let api = 'https://random-word-api.herokuapp.com/word?length=5';
const fileNames = [
    'en4.json',
    'en5.json',
    'en6.json',
    'en7.json',
    'es4.json',
    'es5.json',
    'es6.json',
    'es7.json',
]



const fetchWord = async (filePath) => {
  // Get the lang of the file path by getting the first 2 characters
  const lang = filePath.substring(0, 2);
  const length = filePath.substring(2, 3);
  if (lang === 'en') {
    api = `https://random-word-api.herokuapp.com/word?number=5&length=${length}`;
  } else {
    api = `https://random-word-api.herokuapp.com/word?number=5&length=${length}&lang=${lang}`;
  }

  const response = await fetch(api);
  const data = await response.json();
  return addToFile(data, filePath);
}

const addToFile = (words, filePath) => {
  let wordsToAdd = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  // Add word to json array
  fs.readFile(`../words/${filePath}`, 'utf8', (err, data) => {
    if (err) throw err;
    const file = JSON.parse(data);
    // Check if one of the words is already in the file
    wordsToAdd = wordsToAdd.filter((word) => {
      if (!file.includes(word)) {
        return word;
      } else {
        console.log(`Word "${word}" already in file`);
      }
    });
    // Add the words to the file
    const newFile = file.concat(wordsToAdd);
    fs.writeFile(`../words/${filePath}`, JSON.stringify(newFile), (err) => {
      if (err) throw err;
      console.log('\x1b[32m%s\x1b[0m', `Words Added to ${filePath}`, '\x1b[0m', `${wordsToAdd}`);
    });
  });
}

(async () => {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select a file',
    choices: fileNames.map((file) => ({ title: file, value: file }))
  });

  setInterval(async () => {
    await fetchWord(response.value);
  }, 2000);
})();