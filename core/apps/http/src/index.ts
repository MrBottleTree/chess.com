import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello from chess.com repo!! lol');
});

app.get('/hello',(req, res) => {
    res.send({message: 'Hello World'});
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
