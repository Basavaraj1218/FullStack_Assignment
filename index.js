const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { readFile, writeFile } = require('fs/promises');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/exercises', async (req, res) => {
  try {
    const data = await readFile('data.json', 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.categories);
  } catch (err) {
    console.error('Error reading data:', err);
    res.status(500).send('Error reading data');
  }
});


app.post('/api/programs', async (req, res) => {
  const newProgram = req.body;
  try {
    const data = await readFile('data.json', 'utf8');
    const jsonData = JSON.parse(data);
    jsonData.programs.push(newProgram);
    await writeFile('data.json', JSON.stringify(jsonData, null, 2));
    res.status(201).send('Program saved successfully');
  } catch (err) {
    console.error('Error saving program:', err);
    res.status(500).send('Error saving program');
  }
});


app.get('/api/programs', async (req, res) => {
  try {
    const data = await readFile('data.json', 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.programs);
  } catch (err) {
    console.error('Error reading data:', err);
    res.status(500).send('Error reading data');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
