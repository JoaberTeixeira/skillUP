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
            telefone: {type:String}
    })

    export default conexao.model('Usuario', Usuario)
