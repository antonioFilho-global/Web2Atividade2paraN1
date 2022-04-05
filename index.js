const express = require('express');
require('dotenv').config()
const app = express();
const con = require('./model/conexao')
const jwt = require('jsonwebtoken');
const {obterAlunos} = require('./model/alunosModel');

/* Informa ao express que vai ser recebido JSON */
app.use(express.json());

/* A. Rota get para obter todos os alunos */
app.get('/bd/alunos', async (req, res) => {
    try{
        const resultado = await obterAlunos(req, res);
        const dados =  resultado.rows;
        res.json(dados);
    } catch(erro) {
        res.json({'mensagem': 'Erro na obteção dos dados'})
    }
})

/* B. Rota GET para obter um aluno pelo id*/
app.get('/bd/alunos/:id', async  (req, res) => {
    const resultado = await obterAlunos(req, res);
    const dados =  resultado.rows;
    let achado = null;
    dados.forEach( (objeto) => {
        if (objeto.id == req.params.id) {
            achado = objeto;
        } 
    });
    if (achado) {
        res.json(achado);
    } else {
        res.json({
            mensagem: 'Valor não encontrado',
            erro: true
        });
    }
});

/*C. Rota para login */
app.post('/login', (req, res) => {
    if (req.body.user === 'antoniofilho' && req.body.pass === '123456') {
        const id = 1;
        var token = jwt.sign({id}, process.env.APP_KEY, {expiresIn: 300});
        res.set("x-access-token", token);
        res.json({auth: true, token: token});
    } else {
        res.status(500).json({mensagem: 'Login inválido'});
    }
});

function verifyJWT (req, res, next) {
    let token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).json({auth: false, mensagem: 'Sem token de verificação'});
    }

    jwt.verify(token, process.env.APP_KEY , function (error, decoded) {
        if (error) {
            return res.status(500).json({mensagem: 'Token inválido'});
        }
        next();
    });
}

/* D. Rota POST protegida para cadastrar um novo aluno */
app.post('/bd/cadastrarAluno', verifyJWT, async (req, res) => {
    const {id, nome} = req.body;
    const resultado = await con.query(`insert into alunos(id, nome) values('${id}', '${nome}')`);
    return res.json(({mensagem: 'Usuário Cadastrado com Sucesso'}))
});

/* E. Rota PUT protegida para atualizar um aluno */
app.put('/bd/atualizarAluno:id', verifyJWT , async (req, res) => {
    const identificador = req.params.id;
    const { id, nome } = req.body;
    const resultado = await con.query(`UPDATE alunos set id = '${id}',  nome = '${nome}' WHERE id = ${identificador};`);
    return res.json(({mensagem: 'Usuário Atualizado com Sucesso'}))
});

/* F. Rota DELETE protegida para excluir um aluno */
app.delete('/bd/deletarAluno:id', verifyJWT , async (req, res) => {
    const identificador = req.params.id
    const resultado = await con.query(`DELETE from alunos where id = ${identificador};`);
    return res.json(({mensagem: 'Usuário Deletado com Sucesso'}))
});


app.listen(process.env.PORT || 3000, () => {
    console.log('Aplicação Rodando')
}); 
