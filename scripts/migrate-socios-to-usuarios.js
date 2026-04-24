import conexao from '../config/conexao.js';

async function migrate() {
  try {
    const db = conexao.connection.db;

    const sociosExists = await db.listCollections({ name: 'socios' }).hasNext();
    if (!sociosExists) {
      console.log('Colecao "socios" nao encontrada. Nada para migrar.');
      return;
    }

    const socios = await db.collection('socios').find({}).toArray();
    if (!socios.length) {
      console.log('Colecao "socios" vazia. Nada para migrar.');
      return;
    }

    const ops = socios.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    const result = await db.collection('usuarios').bulkWrite(ops, { ordered: false });

    console.log('Migracao concluida.');
    console.log(`Documentos encontrados em "socios": ${socios.length}`);
    console.log(`Inseridos em "usuarios": ${result.upsertedCount}`);
  } catch (err) {
    console.error('Erro na migracao:', err.message);
    process.exitCode = 1;
  } finally {
    await conexao.disconnect();
  }
}

migrate();
