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
  addToFile(data, filePath, length);
}

const addToFile = (words, filePath, wordLength) => {
  let wordsToAdd = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  // Change accented characters to their non-accented version
  wordsToAdd = wordsToAdd.map((word) => word.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  // Check if the word has punctuation and remove it
  wordsToAdd = wordsToAdd.map((word) => word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''));
  // Check if the word has a number and remove it
  wordsToAdd = wordsToAdd.map((word) => word.replace(/[0-9]/g, ''));
  // Check if the word has a space and remove it
  wordsToAdd = wordsToAdd.map((word) => word.replace(/\s/g, ''));
  // Check if the word has a character that is not a letter, including accents and ñ
  wordsToAdd = wordsToAdd.map((word) => word.replace(/[^a-zA-Z\u00C0-\u017F]/g, ''));
  // Check if the word is the correct length
  wordsToAdd = wordsToAdd.filter((word) => word.length === parseInt(wordLength));

  // Add word to json array
  fs.readFile(`../words/${filePath}`, 'utf8', (err, data) => {
    if (err) throw err;
    const file = JSON.parse(data);
    // Check if one of the words is already in the file
    wordsToAdd = wordsToAdd.filter((word) => {
      if (!file.includes(word)) {
        return word;
      } else {
        // Red color
        console.log(`\x1b[31m${word} is already in the file\x1b[0m`);
      }
    });
    // Add the words to the file
    const newFile = file.concat(wordsToAdd);
    fs.writeFile(`../words/${filePath}`, JSON.stringify(newFile), (err) => {
      if (err) throw err;
      if (wordsToAdd.length > 0) {
        console.log('\x1b[32m%s\x1b[0m', `Words Added to ${filePath}`, '\x1b[0m', `${wordsToAdd}`);
      } else {
        // Yellow color
        console.log('\x1b[33m%s\x1b[0m', `No words added to ${filePath}`);
      }
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

  if (response.value) {
    setInterval(async () => {
      await fetchWord(response.value);
    }, 2000);
  }
})();