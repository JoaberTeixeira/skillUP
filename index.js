import express from 'express'
import path from 'path';
import { fileURLToPath } from 'url'; 
import { dirname } from 'path';
import session from 'express-session';

const app = express();

app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(session({
    secret: process.env.SESSION_SECRET || 'wikiosasco-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 8
    }
}));

app.use((req, res, next) => {
    res.locals.user = req.session?.user || null;
    next();
});

// Converte o caminho do arquivo atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Libera acesso à pasta public
app.use(express.static(__dirname + '/public'))

// Define onde estão as views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

import routes from "./routes/route.js"
app.use(routes)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Porta ${PORT} já está em uso. Pare o processo que estiver usando ou escolha outra porta.`);
    } else {
        console.error('Erro ao iniciar o servidor:', err);
    }
});
