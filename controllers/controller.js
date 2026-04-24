import Usuario from "../models/usuario.js";
import Postagem from "../models/postagem.js";
import Feed from "../models/feed.js";
import { canManagePost } from "../middlewares/auth.js";

const CATEGORIAS_POSTAGEM = ['todas', 'basquete', 'volei', 'futsal', 'futebol', 'handebol', 'tenis', 'futvolei', 'volei de areia', 'padel', 'outros esportes'];

export async function home(req, res) {
    res.render('admin/index');
}

export async function loginChoice(req, res) {
    if (req.session?.user) {
        return res.redirect('/');
    }
    res.render('admin/login_choice');
}

export async function setupUsers(req, res) {
    try {
        await Usuario.findOneAndUpdate(
            { email: 'professor@wiki.com' },
            {
                nome: 'Prof. Jose',
                cpf: '00011122233',
                email: 'professor@wiki.com',
                senha: 'senha123',
                role: 'professor'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await Usuario.findOneAndUpdate(
            { email: 'aluno@wiki.com' },
            {
                nome: 'Aluno Maria',
                cpf: '44455566677',
                email: 'aluno@wiki.com',
                senha: 'senha123',
                role: 'aluno'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.send('Usuarios de exemplo criados: professor@wiki.com / aluno@wiki.com (senha: senha123)');
    } catch (err) {
        res.status(500).send('Erro ao criar usuarios: ' + err.message);
    }
}

export async function showLoginForm(req, res) {
    const role = req.params.role;
    if (!['professor', 'aluno'].includes(role)) {
        return res.status(404).send('Rota de login invalida');
    }
    res.render('admin/login', { role, error: null });
}

export async function showRegisterForm(req, res) {
    res.render('admin/register', { error: null, success: null, form: {} });
}

export async function registerUser(req, res) {
    try {
        const { nome, cpf, email, senha, role } = req.body;

        const roleNormalizado = ['aluno', 'professor'].includes(role) ? role : 'aluno';

        const emailExistente = await Usuario.findOne({ email });
        if (emailExistente) {
            return res.status(400).render('admin/register', {
                error: 'Ja existe um usuario com este email.',
                success: null,
                form: { nome, cpf, email, role: roleNormalizado }
            });
        }

        const cpfExistente = await Usuario.findOne({ cpf });
        if (cpfExistente) {
            return res.status(400).render('admin/register', {
                error: 'Ja existe um usuario com este CPF.',
                success: null,
                form: { nome, cpf, email, role: roleNormalizado }
            });
        }

        await Usuario.create({
            nome,
            cpf,
            email,
            senha,
            role: roleNormalizado
        });

        return res.render('admin/register', {
            error: null,
            success: 'Usuario criado com sucesso. Agora voce pode fazer login.',
            form: {}
        });
    } catch (err) {
        return res.status(500).render('admin/register', {
            error: 'Erro ao cadastrar usuario: ' + err.message,
            success: null,
            form: req.body || {}
        });
    }
}

export async function login(req, res) {
    try {
        const { email, senha } = req.body;
        const requestedRole = req.body.role;
        let user = null;

        if (requestedRole) {
            user = await Usuario.findOne({ email, senha, role: requestedRole });
        }

        // Fallback para base antiga/dados inconsistentes de perfil
        if (!user) {
            user = await Usuario.findOne({ email, senha });
        }

        if (!user) {
            return res.status(401).render('admin/login', {
                role: requestedRole || 'aluno',
                error: 'Email, senha ou perfil incorreto.'
            });
        }

        req.session.user = {
            id: user._id,
            nome: user.nome,
            email: user.email,
            role: user.role,
            foto: user.foto || null
        };

        return res.redirect('/');
    } catch (err) {
        res.status(500).send('Erro no login: ' + err.message);
    }
}

export async function logout(req, res) {
    req.session.destroy(() => {
        res.redirect('/login');
    });
}

export async function perfil(req, res) {
    try {
        const usuario = await Usuario.findById(req.session.user.id);
        if (!usuario) {
            return res.status(404).send('Perfil nao encontrado');
        }
        res.render('admin/perfil/index', { usuario });
    } catch (err) {
        res.status(500).send('Erro ao carregar perfil: ' + err.message);
    }
}

export async function abreedtperfil(req, res) {
    try {
        const usuario = await Usuario.findById(req.session.user.id);
        if (!usuario) {
            return res.status(404).send('Perfil nao encontrado');
        }
        res.render('admin/perfil/edt', { usuario });
    } catch (err) {
        res.status(500).send('Erro ao carregar edicao de perfil: ' + err.message);
    }
}

export async function edtperfil(req, res) {
    const updateData = {
        nome: req.body.nome,
        email: req.body.email,
        bio: req.body.bio,
        telefone: req.body.telefone
    };

    if (req.body.senha) {
        updateData.senha = req.body.senha;
    }

    if (req.file) {
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).send('A foto de perfil deve ser uma imagem.');
        }
        updateData.foto = `/uploads/${req.file.filename}`;
    }

    try {
        const usuario = await Usuario.findByIdAndUpdate(req.session.user.id, updateData, { new: true });
        if (!usuario) {
            return res.status(404).send('Perfil nao encontrado');
        }

        req.session.user.nome = usuario.nome;
        req.session.user.email = usuario.email;
        req.session.user.role = usuario.role;
        req.session.user.foto = usuario.foto || null;

        res.redirect('/admin/perfil');
    } catch (err) {
        res.status(500).send('Erro ao atualizar perfil: ' + err.message);
    }
}

// -------POSTAGEM----------

export async function abreaddpostagem(req, res) {
    res.render('admin/postagem/add');
}

export async function addpostagem(req, res) {
    try {
        if (req.session.user.role !== 'professor') {
            return res.status(403).send('Apenas professores podem criar postagens.');
        }

        await Postagem.create({
            titulo: req.body.titulo,
            midia: req.file ? `/uploads/${req.file.filename}` : undefined,
            descricao: req.body.descricao,
            categoria: req.body.categoria || 'esporte',
            autorId: req.session.user.id,
            autorNome: req.session.user.nome,
            autorRole: req.session.user.role,
            autorFoto: req.session.user.foto || undefined
        });
        res.redirect('/admin/postagem/lst');
    } catch (err) {
        res.status(500).send('Erro ao criar postagem: ' + err.message);
    }
}

export async function listarpostagem(req, res) {
    try {
        const postagens = await Postagem.find({ autorId: req.session.user.id }).sort({ _id: -1 });
        res.render('admin/postagem/lst', { postagens });
    } catch (erro) {
        res.status(500).send('Erro ao listar postagens: ' + erro.message);
    }
}

export async function filtrarpostagem(req, res) {
    try {
        const busca = req.body.busca || '';
        const categoria = req.body.categoria || 'todas';
        const query = {
            autorId: req.session.user.id,
            titulo: new RegExp(busca, 'i')
        };
        if (categoria !== 'todas') {
            query.categoria = categoria;
        }
        const postagens = await Postagem.find(query).sort({ _id: -1 });
        res.render('admin/postagem/lst', { postagens });
    } catch (err) {
        res.status(500).send('Erro ao filtrar postagens: ' + err.message);
    }
}

export async function likePostagem(req, res) {
    const id = req.params.id;
    try {
        const postagem = await Postagem.findById(id);
        if (!postagem) {
            return res.status(404).send('Postagem nao encontrada');
        }

        const userId = req.session.user.id;
        const alreadyLiked = postagem.curtidas.some((like) => like.toString() === userId);
        if (alreadyLiked) {
            postagem.curtidas = postagem.curtidas.filter((like) => like.toString() !== userId);
        } else {
            postagem.curtidas.push(userId);
        }

        await postagem.save();
        res.redirect(req.get('referer') || '/admin/feed/lst');
    } catch (err) {
        res.status(500).send('Erro ao curtir postagem: ' + err.message);
    }
}

export async function commentPostagem(req, res) {
    const id = req.params.id;
    try {
        const texto = (req.body.texto || '').trim();
        if (!texto) {
            return res.redirect(req.get('referer') || '/admin/feed/lst');
        }

        const postagem = await Postagem.findById(id);
        if (!postagem) {
            return res.status(404).send('Postagem nao encontrada');
        }

        postagem.comentarios.push({
            autorId: req.session.user.id,
            autorNome: req.session.user.nome,
            autorRole: req.session.user.role,
            texto,
            createdAt: new Date()
        });

        await postagem.save();
        res.redirect(req.get('referer') || '/admin/feed/lst');
    } catch (err) {
        res.status(500).send('Erro ao comentar postagem: ' + err.message);
    }
}

export async function deletapostagem(req, res) {
    const id = req.params.id;
    try {
        const postagem = await Postagem.findById(id);
        if (!postagem) {
            return res.status(404).send('Postagem nao encontrada');
        }

        if (!canManagePost(req, postagem)) {
            return res.status(403).send('Sem permissao para excluir esta postagem');
        }

        await Postagem.findByIdAndDelete(id);
        res.redirect('/admin/postagem/lst');
    } catch (err) {
        res.status(500).send('Erro ao deletar postagem: ' + err.message);
    }
}

export async function abreedtpostagem(req, res) {
    const id = req.params.id;
    try {
        const postagem = await Postagem.findById(id);

        if (!postagem) {
            return res.status(404).send('Postagem nao encontrada');
        }

        if (!canManagePost(req, postagem)) {
            return res.status(403).send('Sem permissao para editar esta postagem');
        }

        res.render('admin/postagem/edt', { postagem });
    } catch (err) {
        res.status(500).send('Erro ao carregar postagem para edicao: ' + err.message);
    }
}

export async function edtpostagem(req, res) {
    const id = req.params.id;
    try {
        const postagem = await Postagem.findById(id);

        if (!postagem) {
            return res.status(404).send('Postagem nao encontrada');
        }

        if (!canManagePost(req, postagem)) {
            return res.status(403).send('Sem permissao para editar esta postagem');
        }

        const updateData = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            categoria: req.body.categoria || postagem.categoria || 'esporte'
        };

        if (req.file) {
            updateData.midia = `/uploads/${req.file.filename}`;
        }

        await Postagem.findByIdAndUpdate(id, updateData);
        res.redirect('/admin/postagem/lst');
    } catch (err) {
        res.status(500).send('Erro ao editar postagem: ' + err.message);
    }
}

// --------USUARIO--------

export async function abreaddusuario(req, res) {
    res.render('admin/usuario/add');
}

export async function addusuario(req, res) {
    try {
        await Usuario.create({
            nome: req.body.nome,
            cpf: req.body.cpf,
            email: req.body.email,
            senha: req.body.senha,
            role: req.body.role || 'aluno',
            foto: req.body.foto,
            bio: req.body.bio,
            telefone: req.body.telefone
        });
        res.redirect('/admin/usuario/lst');
    } catch (err) {
        res.status(500).send('Erro ao cadastrar usuario: ' + err.message);
    }
}

export async function listarusuario(req, res) {
    try {
        const usuarios = await Usuario.find();
        res.render('admin/usuario/lst', { usuarios });
    } catch (erro) {
        res.status(500).send('Erro ao listar usuarios: ' + erro.message);
    }
}

export async function filtrarusuario(req, res) {
    try {
        const busca = req.body.busca || '';
        const usuarios = await Usuario.find({ nome: new RegExp(busca, 'i') });
        res.render('admin/usuario/lst', { usuarios });
    } catch (erro) {
        res.status(500).send('Erro ao filtrar usuarios: ' + erro.message);
    }
}

export async function deletausuario(req, res) {
    const id = req.params.id;
    try {
        await Usuario.findByIdAndDelete(id);
        res.redirect('/admin/usuario/lst');
    } catch (err) {
        res.status(500).send('Erro ao deletar usuario: ' + err.message);
    }
}

export async function abreedtusuario(req, res) {
    const id = req.params.id;
    try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).send('Usuario nao encontrado');
        }
        res.render('admin/usuario/edt', { usuario });
    } catch (error) {
        res.status(500).send('Erro ao buscar usuario: ' + error.message);
    }
}

export async function edtusuario(req, res) {
    const id = req.params.id;
    const updateData = {
        nome: req.body.nome,
        cpf: req.body.cpf,
        email: req.body.email,
        role: req.body.role || 'aluno',
        foto: req.body.foto,
        bio: req.body.bio,
        telefone: req.body.telefone
    };

    if (req.body.senha) {
        updateData.senha = req.body.senha;
    }

    try {
        await Usuario.findByIdAndUpdate(id, updateData);
        res.redirect('/admin/usuario/lst');
    } catch (err) {
        res.status(500).send('Erro ao editar usuario: ' + err.message);
    }
}

// -------FEED--------

export async function abreaddFeed(req, res) {
    res.render('admin/feed/add');
}

export async function addfeed(req, res) {
    try {
        await Feed.create({
            adversario: req.body.adversario,
            data: new Date(req.body.data),
            local: req.body.local,
            resultado: req.body.resultado || ''
        });
        res.redirect('/admin/feed/lst');
    } catch (err) {
        res.status(500).send('Erro ao adicionar feed: ' + err.message);
    }
}

export async function listarfeed(req, res) {
    try {
        const feeds = await Feed.find();
        const postagens = await Postagem.find()
            .populate('autorId', 'foto')
            .sort({ createdAt: -1, _id: -1 });
        res.render('admin/feed/lst', { feeds, postagens, categorias: CATEGORIAS_POSTAGEM, selectedCategoria: 'todas' });
    } catch (err) {
        res.status(500).send('Erro ao listar feeds: ' + err.message);
    }
}

export async function filtrarfeed(req, res) {
    try {
        const busca = req.body.busca || '';
        const selectedCategoria = req.body.categoria || 'todas';
        const feedQuery = { adversario: new RegExp(busca, 'i') };
        const postQuery = selectedCategoria === 'todas' ? {} : { categoria: selectedCategoria };

        const feeds = await Feed.find(feedQuery);
        const postagens = await Postagem.find(postQuery)
            .populate('autorId', 'foto')
            .sort({ createdAt: -1, _id: -1 });
        res.render('admin/feed/lst', { feeds, postagens, categorias: CATEGORIAS_POSTAGEM, selectedCategoria });
    } catch (err) {
        res.status(500).send('Erro ao filtrar feeds: ' + err.message);
    }
}

export async function deletafeed(req, res) {
    const d = req.params.id;
    try {
        await Feed.findByIdAndDelete(d);
        res.redirect('/admin/feed/lst');
    } catch (err) {
        res.status(500).send('Erro ao deletar feed: ' + err.message);
    }
}

export async function abreedtfeed(req, res) {
    const id = req.params.id;
    try {
        const feed = await Feed.findById(id);
        if (!feed) {
            return res.status(404).send('Feed nao encontrado');
        }
        res.render('admin/feed/edt', { feed });
    } catch (error) {
        res.status(500).send('Erro ao buscar o feed: ' + error.message);
    }
}

export async function edtfeed(req, res) {
    const e = req.params.id;
    try {
        await Feed.findByIdAndUpdate(e, {
            adversario: req.body.adversario,
            data: new Date(req.body.data),
            local: req.body.local,
            resultado: req.body.resultado
        });
        res.redirect('/admin/feed/lst');
    } catch (err) {
        res.status(500).send('Erro ao editar feed: ' + err.message);
    }
}
