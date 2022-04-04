const con = require('./conexao');

const obterAlunos = async (req, res) => {
    const resultado = await con.query('select * from alunos');
    return resultado;
}

module.exports = {obterAlunos}