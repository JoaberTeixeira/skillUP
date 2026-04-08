import Socio from "../models/socio.js";
import Postagem from "../models/postagem.js";
import Jogo from "../models/jogo.js";
import { canManagePost } from "../middlewares/auth.js";

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
        await Socio.findOneAndUpdate(
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

        await Socio.findOneAndUpdate(
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

        const emailExistente = await Socio.findOne({ email });
        if (emailExistente) {
            return res.status(400).render('admin/register', {
                error: 'Ja existe um usuario com este email.',
                success: null,
                form: { nome, cpf, email, role: roleNormalizado }
            });
        }

        const cpfExistente = await Socio.findOne({ cpf });
        if (cpfExistente) {
            return res.status(400).render('admin/register', {
                error: 'Ja existe um usuario com este CPF.',
                success: null,
                form: { nome, cpf, email, role: roleNormalizado }
            });
        }

        await Socio.create({
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
            user = await Socio.findOne({ email, senha, role: requestedRole });
        }

        // Fallback para base antiga/dados inconsistentes de perfil
        if (!user) {
            user = await Socio.findOne({ email, senha });
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
            role: user.role
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
        const socio = await Socio.findById(req.session.user.id);
        if (!socio) {
            return res.status(404).send('Perfil nao encontrado');
        }
        res.render('admin/perfil/index', { socio });
    } catch (err) {
        res.status(500).send('Erro ao carregar perfil: ' + err.message);
    }
}

export async function abreedtperfil(req, res) {
    try {
        const socio = await Socio.findById(req.session.user.id);
        if (!socio) {
            return res.status(404).send('Perfil nao encontrado');
        }
        res.render('admin/perfil/edt', { socio });
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
        const socio = await Socio.findByIdAndUpdate(req.session.user.id, updateData, { new: true });
        if (!socio) {
            return res.status(404).send('Perfil nao encontrado');
        }

        req.session.user.nome = socio.nome;
        req.session.user.email = socio.email;
        req.session.user.role = socio.role;

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
            autorId: req.session.user.id,
            autorNome: req.session.user.nome,
            autorRole: req.session.user.role
        });
        res.redirect('/admin/postagem/lst');
    } catch (err) {
        res.status(500).send('Erro ao criar postagem: ' + err.message);
    }
}

export async function listarpostagem(req, res) {
    try {
        const postagens = await Postagem.find().sort({ _id: -1 });
        res.render('admin/postagem/lst', { postagens });
    } catch (erro) {
        res.status(500).send('Erro ao listar postagens: ' + erro.message);
    }
}

export async function filtrarpostagem(req, res) {
    try {
        const busca = req.body.busca || '';
        const postagens = await Postagem.find({ titulo: new RegExp(busca, 'i') }).sort({ _id: -1 });
        res.render('admin/postagem/lst', { postagens });
    } catch (err) {
        res.status(500).send('Erro ao filtrar postagens: ' + err.message);
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
            descricao: req.body.descricao
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

// --------SOCIO--------

export async function abreaddsocio(req, res) {
    res.render('admin/socio/add');
}

export async function addsocio(req, res) {
    try {
        await Socio.create({
            nome: req.body.nome,
            cpf: req.body.cpf,
            email: req.body.email,
            senha: req.body.senha,
            role: req.body.role || 'aluno',
            foto: req.body.foto,
            bio: req.body.bio,
            telefone: req.body.telefone
        });
        res.redirect('/admin/socio/lst');
    } catch (err) {
        res.status(500).send('Erro ao cadastrar socio: ' + err.message);
    }
}

export async function listarsocio(req, res) {
    try {
        const socios = await Socio.find();
        res.render('admin/socio/lst', { socios });
    } catch (erro) {
        res.status(500).send('Erro ao listar socios: ' + erro.message);
    }
}

export async function filtrarsocio(req, res) {
    try {
        const busca = req.body.busca || '';
        const socios = await Socio.find({ nome: new RegExp(busca, 'i') });
        res.render('admin/socio/lst', { socios });
    } catch (erro) {
        res.status(500).send('Erro ao filtrar socios: ' + erro.message);
    }
}

export async function deletasocio(req, res) {
    const id = req.params.id;
    try {
        await Socio.findByIdAndDelete(id);
        res.redirect('/admin/socio/lst');
    } catch (err) {
        res.status(500).send('Erro ao deletar socio: ' + err.message);
    }
}

export async function abreedtsocio(req, res) {
    const id = req.params.id;
    try {
        const socio = await Socio.findById(id);
        if (!socio) {
            return res.status(404).send('Socio nao encontrado');
        }
        res.render('admin/socio/edt', { socio });
    } catch (error) {
        res.status(500).send('Erro ao buscar socio: ' + error.message);
    }
}

export async function edtsocio(req, res) {
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
        await Socio.findByIdAndUpdate(id, updateData);
        res.redirect('/admin/socio/lst');
    } catch (err) {
        res.status(500).send('Erro ao editar socio: ' + err.message);
    }
}

// -------JOGOS--------

export async function listarjogo(req, res) {
    try {
        const jogos = await Jogo.find();
        const postagens = await Postagem.find().sort({ createdAt: -1, _id: -1 });
        res.render('admin/jogo/lst', { jogos, postagens });
    } catch (err) {
        res.status(500).send('Erro ao listar jogos: ' + err.message);
    }
}

export async function filtrarjogo(req, res) {
    try {
        const busca = req.body.busca || '';
        const jogos = await Jogo.find({ adversario: new RegExp(busca, 'i') });
        const postagens = await Postagem.find().sort({ createdAt: -1, _id: -1 });
        res.render('admin/jogo/lst', { jogos, postagens });
    } catch (err) {
        res.status(500).send('Erro ao filtrar jogos: ' + err.message);
    }
}

export async function deletajogo(req, res) {
    const d = req.params.id;
    try {
        await Jogo.findByIdAndDelete(d);
        res.redirect('/admin/jogo/lst');
    } catch (err) {
        res.status(500).send('Erro ao deletar jogo: ' + err.message);
    }
}

export async function abreedtjogo(req, res) {
    const id = req.params.id;
    try {
        const jogo = await Jogo.findById(id);
        if (!jogo) {
            return res.status(404).send('Jogo nao encontrado');
        }
        res.render('admin/jogo/edt', { jogo });
    } catch (error) {
        res.status(500).send('Erro ao buscar o jogo: ' + error.message);
    }
}

export async function edtjogo(req, res) {
    const e = req.params.id;
    try {
        await Jogo.findByIdAndUpdate(e, {
            adversario: req.body.adversario,
            data: new Date(req.body.data),
            local: req.body.local,
            resultado: req.body.resultado
        });
        res.redirect('/admin/jogo/lst');
    } catch (err) {
        res.status(500).send('Erro ao editar jogo: ' + err.message);
    }
}
