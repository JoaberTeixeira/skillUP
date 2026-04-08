import conexao from "../config/conexao.js"

const Feed = new conexao.Schema({
    adversario: { type: String, required: true },
    data: { type: Date, required: true },
    local: { type: String, required: true },
    resultado: { type: String } // Ex: "3x1", ou pode deixar vazio se for feed futuro
})

export default conexao.model('Feed', Feed)
