import conexao from "../config/conexao.js"

const Usuario = conexao.Schema(
    {
            nome: {type:String, required: true},
            cpf: {type:String, required: true},
            email: {type:String, required: true},
            senha: {type:String, required: true},
            role: {type:String, required: true, enum: ['professor', 'aluno']},
            foto: {type:String},
            bio: {type:String},
            telefone: {type:String},
            
            // Campos comuns
            localizacao: {type:String},
            dataNascimento: {type:Date},
            
            // Campos específicos para alunos
            nivelExperiencia: {type:String, enum: ['iniciante', 'intermediario', 'avancado'], default: 'iniciante'},
            especialidades: {type:[String], default: []},
            interesses: {type:[String], default: []},
            
            // Campos específicos para professores
            certificacoes: {type:[String], default: []},
            experiencia: {type:Number, default: 0}, // em anos
            locaisAtuacao: {type:[String], default: []},
            horariosDisponíveis: {type:String},
            totalAulas: {type:Number, default: 0},
            avaliacaoMedia: {type:Number, default: 0},
            
            // Auditoria
            criadoEm: {type:Date, default: Date.now},
            atualizadoEm: {type:Date, default: Date.now}
    })

    export default conexao.model('Usuario', Usuario)
