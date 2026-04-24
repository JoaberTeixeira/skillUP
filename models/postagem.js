import conexao from "../config/conexao.js"

const Postagem = conexao.Schema(
    {
            titulo: { type: String, required: true },
            midia: { type: String, required: true },
            descricao: { type: String, required: true },
            categoria: { type: String, required: true, enum: ['basquete', 'volei', 'futsal', 'futebol', 'handebol', 'tenis', 'futvolei', 'volei de areia', 'padel', 'outros esportes'], default: 'basquete' },
            autorId: { type: conexao.Schema.Types.ObjectId, ref: 'Usuario', required: true },
            autorNome: { type: String, required: true },
            autorRole: { type: String, required: true, enum: ['professor', 'aluno'] },
            autorFoto: { type: String },
            curtidas: [{ type: conexao.Schema.Types.ObjectId, ref: 'Usuario', default: [] }],
            comentarios: [{
                autorId: { type: conexao.Schema.Types.ObjectId, ref: 'Usuario', required: true },
                autorNome: { type: String, required: true },
                autorRole: { type: String, required: true, enum: ['professor', 'aluno'] },
                texto: { type: String, required: true },
                createdAt: { type: Date, default: Date.now }
            }]
    },
    { timestamps: true })

    export default conexao.model('Postagem', Postagem)
