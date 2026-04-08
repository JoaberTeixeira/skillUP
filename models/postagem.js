import conexao from "../config/conexao.js"

const Postagem = conexao.Schema(
    {
            titulo: { type: String, required: true },
            midia: { type: String, required: true },
            descricao: { type: String, required: true },
            autorId: { type: conexao.Schema.Types.ObjectId, ref: 'Socio', required: true },
            autorNome: { type: String, required: true },
            autorRole: { type: String, required: true, enum: ['professor', 'aluno'] }
    },
    { timestamps: true })

    export default conexao.model('Postagem', Postagem)
