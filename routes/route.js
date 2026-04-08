// routes/route.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base || 'midia'}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    return cb(null, true);
  }
  return cb(new Error('Formato de midia invalido. Envie imagem ou video.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});
import { requireAuth, requireProfessor } from '../middlewares/auth.js';

import {
  home,
  setupUsers,
  loginChoice,
  showLoginForm,
  showRegisterForm,
  registerUser,
  login,
  logout,
  perfil, abreedtperfil, edtperfil,
  abreedtpostagem, edtpostagem, abreaddpostagem, deletapostagem, addpostagem, listarpostagem, filtrarpostagem,
  abreedtfeed, edtfeed, deletafeed, listarfeed, filtrarfeed, abreaddFeed, addfeed,
} from '../controllers/controller.js';

// PUBLICAS
router.get('/login', loginChoice);
router.get('/login/:role', showLoginForm);
router.get('/register', showRegisterForm);
router.post('/register', registerUser);
router.post('/login', login);
router.get('/setup/users', setupUsers);

// PRIVADAS
router.use(requireAuth);
router.post('/logout', logout);
router.get('/', home);
router.get('/admin/perfil', perfil);
router.get('/admin/perfil/edt', abreedtperfil);
router.post('/admin/perfil/edt', upload.single('foto'), edtperfil);

// POSTAGEM
router.get('/admin/postagem/add', requireProfessor, abreaddpostagem);
router.post('/admin/postagem/add', requireProfessor, upload.single('midia'), addpostagem);
router.get('/admin/postagem/lst', requireProfessor, listarpostagem);
router.post('/admin/postagem/lst', requireProfessor, filtrarpostagem);
router.get('/admin/postagem/del/:id', requireProfessor, deletapostagem);
router.get('/admin/postagem/edt/:id', requireProfessor, abreedtpostagem);
router.post('/admin/postagem/edt/:id', requireProfessor, upload.single('midia'), edtpostagem);

// FEED
router.get('/admin/feed/add', abreaddFeed);
router.post('/admin/feed/add', addfeed);
router.get('/admin/feed/lst', listarfeed);
router.post('/admin/feed/lst', filtrarfeed);
router.get('/admin/feed/del/:id', deletafeed);
router.get('/admin/feed/edt/:id', abreedtfeed);
router.post('/admin/feed/edt/:id', edtfeed);

export default router;
