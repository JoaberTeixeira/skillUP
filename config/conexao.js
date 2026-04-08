import mongoose from 'mongoose';
const url ="mongodb+srv://joaberdasilva81_db_user:d0fTL2pYK2lqUDRY@cluster0.oylovhj.mongodb.net/?appName=Cluster0"

const conexao = await mongoose.connect(url)

export default conexao