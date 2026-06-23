import mongoose from 'mongoose';
import Usuario from '../models/usuario.js';
import Postagem from '../models/postagem.js';

const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/skillup';

// Dados dos professores
const professores = [
  {
    nome: 'Prof. Carlos Silva',
    cpf: '12345678901',
    email: 'carlos.silva@skillup.com',
    senha: 'senha123',
    role: 'professor',
    telefone: '(11) 98765-4321',
    localizacao: 'São Paulo, SP',
    bio: 'Instrutor certificado de Futsal com 10 anos de experiência. Especializado em técnicas ofensivas e defesa em quadra reduzida.',
    experiencia: 10,
    especialidades: ['Futsal', 'Futebol de salão', 'Técnicas defensivas'],
    certificacoes: ['Certificado CBFS', 'Licença A - CBF'],
    locaisAtuacao: ['São Paulo', 'Guarulhos', 'Taboão da Serra'],
    horariosDisponíveis: 'Seg-Qua: 18h-21h, Sab: 9h-17h',
    totalAulas: 45,
    avaliacaoMedia: 4.8
  },
  {
    nome: 'Prof. Marina Costa',
    cpf: '98765432109',
    email: 'marina.costa@skillup.com',
    senha: 'senha123',
    role: 'professor',
    telefone: '(11) 99876-5432',
    localizacao: 'Rio de Janeiro, RJ',
    bio: 'Professora de Vôlei com experiência em treinos de base e competições. Formada em Educação Física.',
    experiencia: 8,
    especialidades: ['Vôlei', 'Vôlei de Praia', 'Preparação física'],
    certificacoes: ['Licença B - CBV', 'Curso de Preparação Física'],
    locaisAtuacao: ['Rio de Janeiro', 'Niterói'],
    horariosDisponíveis: 'Ter-Qui: 17h-20h, Dom: 8h-12h',
    totalAulas: 38,
    avaliacaoMedia: 4.9
  },
  {
    nome: 'Prof. João Pereira',
    cpf: '55566677788',
    email: 'joao.pereira@skillup.com',
    senha: 'senha123',
    role: 'professor',
    telefone: '(21) 98765-1234',
    localizacao: 'Belo Horizonte, MG',
    bio: 'Técnico de Basquete com 15 anos de carreira. Especializado em desenvolvimento de talentos.',
    experiencia: 15,
    especialidades: ['Basquete', 'Dribble avançado', 'Lançamentos'],
    certificacoes: ['Técnico Nível I - CBB', 'Curso Avançado de Basquete'],
    locaisAtuacao: ['Belo Horizonte', 'Contagem'],
    horariosDisponíveis: 'Seg-Qui: 19h-22h, Sab-Dom: 10h-16h',
    totalAulas: 62,
    avaliacaoMedia: 4.7
  },
  {
    nome: 'Prof. Ana Silva',
    cpf: '11122233344',
    email: 'ana.silva@skillup.com',
    senha: 'senha123',
    role: 'professor',
    telefone: '(85) 99999-8888',
    localizacao: 'Fortaleza, CE',
    bio: 'Instrutora de Tênis com foco em crianças e adolescentes. Metodologia criativa e dinâmica.',
    experiencia: 7,
    especialidades: ['Tênis', 'Tênis iniciante', 'Mobilidade'],
    certificacoes: ['Instrutor de Tênis - CBT', 'Especialista em Tênis Infantil'],
    locaisAtuacao: ['Fortaleza', 'Região Metropolitana'],
    horariosDisponíveis: 'Ter-Sab: 9h-17h',
    totalAulas: 28,
    avaliacaoMedia: 4.9
  },
  {
    nome: 'Prof. Rafael Santos',
    cpf: '99988877766',
    email: 'rafael.santos@skillup.com',
    senha: 'senha123',
    role: 'professor',
    telefone: '(31) 98888-7777',
    localizacao: 'Brasília, DF',
    bio: 'Professor de Handebol e jogador semi-profissional. Experiência em treinos táticos e físicos.',
    experiencia: 6,
    especialidades: ['Handebol', 'Posicionamento tático', 'Circuito resistência'],
    certificacoes: ['Técnico de Handebol - CBHb', 'Preparador Físico'],
    locaisAtuacao: ['Brasília', 'Ceilândia'],
    horariosDisponíveis: 'Seg-Fri: 18h-21h',
    totalAulas: 35,
    avaliacaoMedia: 4.6
  },
  {
    nome: 'Prof. Beatriz Oliveira',
    cpf: '44455566677',
    email: 'beatriz.oliveira@skillup.com',
    senha: 'senha123',
    role: 'professor',
    telefone: '(47) 98765-5555',
    localizacao: 'Blumenau, SC',
    bio: 'Instrutora de Padel com título de campeã estadual. Aulas personalizadas e grupo.',
    experiencia: 5,
    especialidades: ['Padel', 'Técnica de padel', 'Estratégia de duplas'],
    certificacoes: ['Instrutor Certificado de Padel', 'Campeã Estadual 2023'],
    locaisAtuacao: ['Blumenau', 'Brusque'],
    horariosDisponíveis: 'Seg-Dom: 10h-19h',
    totalAulas: 42,
    avaliacaoMedia: 4.8
  }
];

// Dados das postagens por esporte
const postagens = [
  {
    titulo: 'Técnicas Avançadas de Futsal: Dribbling em Velocidade',
    descricao: 'Nesta aula vamos trabalhar o dribbling em alta velocidade em espaços reduzidos. Aprenderemos técnicas de proteção de bola e mudança de direção.',
    categoria: 'futsal',
    professorIndex: 0
  },
  {
    titulo: 'Fundamentos do Futsal: Passe e Controle',
    descricao: 'Aula voltada para iniciantes que desejam aprender os fundamentos do futsal. Focaremos em passes precisos e controle de bola em movimento.',
    categoria: 'futsal',
    professorIndex: 0
  },
  {
    titulo: 'Treino Tático de Futsal: Sistemas de Jogo',
    descricao: 'Análise dos principais sistemas táticos utilizados no futsal moderno. Posicionamentos, marcação e contra-ataque.',
    categoria: 'futsal',
    professorIndex: 0
  },
  {
    titulo: 'Iniciação ao Vôlei: Posições e Movimentação',
    descricao: 'Aprenda as posições básicas no vôlei e como se movimentar em quadra. Ideal para quem está começando.',
    categoria: 'volei',
    professorIndex: 1
  },
  {
    titulo: 'Saque e Recepção em Vôlei: Aperfeiçoamento',
    descricao: 'Técnicas avançadas de saque com efeito e recepção com passes precisos. Para atletas com experiência.',
    categoria: 'volei',
    professorIndex: 1
  },
  {
    titulo: 'Vôlei de Praia: Técnicas Especiais',
    descricao: 'Especificidades do vôlei de praia: movimentação na areia, técnicas defensivas e estratégia de duplas.',
    categoria: 'volei de areia',
    professorIndex: 1
  },
  {
    titulo: 'Basquete: Fundamentos para Iniciantes',
    descricao: 'Aprenda os fundamentos do basquete: dribbling, passe, arremesso e posicionamento em quadra.',
    categoria: 'basquete',
    professorIndex: 2
  },
  {
    titulo: 'Arremessadores de 3 Pontos: Técnica e Treinamento',
    descricao: 'Desenvolva sua técnica de arremesso de longa distância com exercícios específicos e analise de movimento.',
    categoria: 'basquete',
    professorIndex: 2
  },
  {
    titulo: 'Defesa em Basquete: Estratégias Avançadas',
    descricao: 'Aprenda técnicas defensivas: marcação individual, zona, troca de marcador e defesa em pressão.',
    categoria: 'basquete',
    professorIndex: 2
  },
  {
    titulo: 'Tênis para Iniciantes: Grip e Postura',
    descricao: 'Introdução ao tênis focando na pegada correta, postura corporal e movimentação em quadra.',
    categoria: 'tenis',
    professorIndex: 3
  },
  {
    titulo: 'Saques Potentes de Tênis: Do Básico ao Avançado',
    descricao: 'Técnica completa de saque: empunhadura, lançamento da bola, força e efeito.',
    categoria: 'tenis',
    professorIndex: 3
  },
  {
    titulo: 'Handebol: Fundamentos e Posições',
    descricao: 'Conheça os fundamentos do handebol: passes, arremessos, posicionamento por posição.',
    categoria: 'handebol',
    professorIndex: 4
  },
  {
    titulo: 'Handebol: Sistema Defensivo 6-0',
    descricao: 'Aprofundamento nos sistemas defensivos do handebol. Foco no famoso 6-0 e suas variações.',
    categoria: 'handebol',
    professorIndex: 4
  },
  {
    titulo: 'Padel: Introdução à Modalidade',
    descricao: 'Primeiro contato com o padel: regras básicas, movimentos essenciais e a importância da parede lateral.',
    categoria: 'padel',
    professorIndex: 5
  },
  {
    titulo: 'Padel: Técnicas Ofensivas e Bandeja',
    descricao: 'Domine as principais técnicas ofensivas do padel incluindo a bandeja que é fundamental para vencer pontos.',
    categoria: 'padel',
    professorIndex: 5
  },
  {
    titulo: 'Futebol: Desenvolvimento de Habilidades Técnicas',
    descricao: 'Treinamento focado em dribbling, passe, chute e controle de bola. Para todas as idades.',
    categoria: 'futebol',
    professorIndex: 0
  },
  {
    titulo: 'Futevôlei: Fusão de Dois Esportes',
    descricao: 'Aprenda futevôlei: combine as técnicas de futebol com as regras de vôlei. Modalidade divertida e desafiadora.',
    categoria: 'futvolei',
    professorIndex: 1
  }
];

async function seedDatabase() {
  try {
    console.log('🚀 Conectando ao banco de dados...');
    
    // Desconectar se houver conexão anterior
    if (mongoose.connection.readyState > 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(DB_URI);
    console.log('✅ Banco de dados conectado!');

    // Criar professores
    console.log('👨‍🏫 Criando professores...');
    const professoresIds = [];
    
    for (const prof of professores) {
      let usuario = await Usuario.findOne({ email: prof.email });
      
      if (!usuario) {
        usuario = await Usuario.create(prof);
        console.log(`✅ Professor criado: ${prof.nome}`);
      } else {
        // Atualizar dados existentes
        await Usuario.findByIdAndUpdate(usuario._id, prof);
        console.log(`♻️ Professor atualizado: ${prof.nome}`);
      }
      
      professoresIds.push(usuario._id);
    }

    // Criar postagens
    console.log('📸 Criando postagens...');
    let postagemCount = 0;
    
    for (const post of postagens) {
      const professor = professores[post.professorIndex];
      
      // Verificar se já existe essa postagem
      let existente = await Postagem.findOne({
        titulo: post.titulo,
        autorNome: professor.nome
      });
      
      if (!existente) {
        const novaPostagem = await Postagem.create({
          titulo: post.titulo,
          descricao: post.descricao,
          categoria: post.categoria,
          autorId: professoresIds[post.professorIndex],
          autorNome: professor.nome,
          autorRole: 'professor',
          midia: [],
          curtidas: [],
          comentarios: []
        });
        
        console.log(`✅ Postagem criada: ${post.titulo}`);
      } else {
        console.log(`⏭️  Postagem já existe: ${post.titulo}`);
      }
      
      postagemCount++;
    }

    console.log(`\n✨ Seed concluído com sucesso!`);
    console.log(`📊 Resumo:`);
    console.log(`   - ${professoresIds.length} professores criados/atualizados`);
    console.log(`   - ${postagemCount} postagens processadas`);
    console.log(`   - 7 categorias de esportes diferentes`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao popular banco de dados:', err.message);
    process.exit(1);
  }
}

seedDatabase();
