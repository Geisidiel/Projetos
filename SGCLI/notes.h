/* var express = require('express');
var router = express.Router();

function validCheck (exp,name) {
    return exp.test(name);
}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

var user=db.collection('user'); //gives reference error,db is not defined

router.post('/',function(req,res,next){
    username=req.body.username;
    password=req.body.password;
    //var user=db.collection('user'); //works fine
    user.findOne({'username':username,'password':password},function(err,docs){
        //do something
    });
});

module.exports = router;

//verificação if
<% if (user.isLoggedIn) { %>
  <p>Welcome back, <%= user.name %>!</p>
<% } else { %>
  <p>Please log in to access this content.</p>
<% } %>

//Alert
  <% if (message !="") { %>
    <section class=" <%= type  %>">
      <p><%= message  %></p>
    </section>
  <% } %>

//For.each
  <% Un.forEach(Un => { %>
              <option value="<%= Un.unidades %>"><%= Un.unidades %></option>
  <% }); %>

  cd "%userprofile%\Documents"

  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

  instalar passport lova
  npm install express passport passport-local express-session




  const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

//conexão com banco
const sequelize_db = require('./db/conexão')

//model carregados
const Usuario =require('./controler/model_criar_user');
const { error } = require('console');
const Producao = require('./controler/model_lanca_producaoy')
const Unidades =require('./controler/model_criar_unidades')
const Meta_atividade =require('./controler/model_criar_meta_atividade')
const Horario =  require('./controler/model_criar_horarios')

//const passportConfig = require('./passport-config');
//Criar sessão
const session = require('express-session');
const { console } = require('inspector');
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: false,
}));


// Middleware para analisar dados JSON
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'src')));//pastas publicas staticas
app.use(express.urlencoded({ extended: true }));// captura dos dados

// Rota raiz

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/apontamentos', (req, res) => {
  Producao.findAll().then((Apontamentos)=>{
    res.render('apontamentos',{ apontamentos:Apontamentos,  message:"Dadoos carregados com sucesso",type:"sucess"} );
  })
    
});

// Rota de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Rota de cadastro
app.get('/cadastraruser', (req, res) => {
    res.render('cadastraruser',{message:"",type:""});
  });

//rota dados de forms
app.post('/novousuario',(req,res)=>{
 Usuario.create({ 
    nome: req.body.nome,
    cpf: req.body.cpf,
    unidade: req.body.unidade,
    age: req.body.age,
    type: req.body.type,
    senha: req.body.senha,
  })
  .then(()=>{

    res.render('novousuario',{message:"Novo usuario cadastrado com sucesso!", type:"sucess"} )
    
  })
  .catch((error)=>{
    res.render('cadastraruser',{message:"Erro ao cadastrar usuario ", error, type:"danger"} )
    console.log(error)

  })

})

app.post('/lancaproducao', (req, res) => {

  Producao.create({
    data: req.body.data,
    unidade: req.body.unidade,
    nome: req.body.nome,
    atividade: req.body.atividade,
    horario: req.body.horario,
    producao: req.body.producao,
    meta: req.body.meta,
    eficiencia: req.body.eficiencia,
    gap: req.body.gap,
    n_lote: req.body.n_lote,
    observacao: req.body.observacao,
    ocorrencia: req.body.ocorrencia,
    type: req.body.type,
  
  })
  .then((error)=>{
    Producao.findAll().then((Apontamentos)=>{
      res.render('apontamentos',{ apontamentos:Apontamentos,message:"Novo apontamento registrado ! Dadoos carregados com sucesso!",type:"sucess"} );
    })
    
  })
  .catch((error)=>{
    res.render('apontamentos',{message:"Erro ao cadastrar novo lançamento  ", error, type:"danger"} )
    console.log(error)
  })

 
});
app.get('/lancaproducao', async (req, res) => {
  try {
    // Fetch all data asynchronously
    const [unidades, metAti, horarios, users] = await Promise.all([
      Unidades.findAll(),
      Meta_atividade.findAll(),
      Horario.findAll(),
      Usuario.findAll()
    ]);

    // Render the view with the fetched data
    res.render('novoapontamento', {
      message: "",
      type: "",
      Un: unidades,
      Mt: metAti,
      Hor: horarios,
      Usr: users
    });
  } 
  catch (error) {
    // Handle errors and render an error view or message
    console.error('Error fetching data:', error);
    res.status(500).render('error', { message: 'An error occurred while fetching data.' });
  }
});



app.get('/novoatividade', (req, res) => {
  res.render('atividade_meta',{message:"",type:""});
});
app.post('/novaatividade',(req,res) =>{
  Meta_atividade.create({
    atividade: req.body.atividade,
    meta: req.body.meta
  })
  .then(()=>{
    res.render('atividade_meta',{message:"Nova atividade cadastrada com sucesso!", type:"sucess"} )

  })
  .catch((error)=>{
    res.render('atividade_meta',{message:"Erro ao cadastrar atividade  ", error, type:"sucess"} )

  })
})

app.get('/novounidade', (req, res) => {
  res.render('novo_unidade', {message:"", type:""});
});

app.post('/novaunidade', async (req, res) => {
    try {
      // Verifica se a unidade já existe
      const uni = await Unidades.findOne({ where: { unidades: req.body.unidades } });
  
      if (uni) {
        // Se a unidade já existir, exibe a mensagem de erro
        res.render('novo_unidade', { message: "Unidade já cadastrada!", type: "danger" });
      } else {
        // Se a unidade não existir, cria a nova unidade
        await Unidades.create({ unidades: req.body.unidades });
        res.render('novo_unidade', { message: "Cadastrado com sucesso!", type: "sucess" });
      }
    } catch (error) {
      // Caso ocorra um erro no processo
      console.log(error);
      res.render('novo_unidade', { message: "Erro ao cadastrar", error: error.message, type: "danger" });
    }
});


app.get('/novohorario', (req, res) => {
  res.render('novo_horario',{message:"", type:""});
});

app.post('/novohorario', async (req, res) => {

try {
  const hr = await Horario.findOne({ where: {Horario: req.body.Horario } });

  if (hr) {
    res.render('novo_horario',{message:"Horario ja cadastrado!", type:"danger"} )
  } else {
    await Horario.create({  Horario: req.body.Horario });
        res.render('novo_horario', { message: "Cadastrado com sucesso!", type: "sucess" });
  }
} catch (error) {
  res.render('novo_horario',{message:"Erro ao cadastrar ", error, type:"danger"} )

}
///////////////////////////////////////////////
});


app.get('/listusuarios', (req, res) => {
  Usuario.findAll().then((users)=>{
    res.render('list_users',{Users:users, message:" Dadoos carregados com sucesso!",type:"sucess"});
  })
  
});

*/
// Inicia o servidor
//app.listen(port, () => {
 // console.log(`Servidor rodando em http://localhost:${port}`);
//});

//casa
/*app.listen(port, '192.168.0.23', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});*/
//fabrica info
/*app.listen(port, '192.168.1.71', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});*/

//1991.-0.199.202-8
//codigo js para fazer que o numero que for digitado no  input  processo, seja concatenado no text area con a expressão PROCESSOS SEHAB Nº:poremtudo isso só pode seguir  se no select estiver selecionado PROCESSO
/*router.post('/deletar/:id', async (req, res) => {
  const { id } = req.params;
  await Usuario.destroy({ where: { id } });
  res.redirect('/');
});*/


///localidades
/*lotedisponivel: lote criado disponivelpara insrção de documentos;
loteavincular:  lote com documentos vinculados,disponiel para vincular  a caixa mae;
lotevinculado:  lote vinculado a caixa mae;
loteclassificado:  lote disponivel para prepararçãoo;
lotepreparado:  lote disponivel paradigitalização;
lotedigitalizado:  lote disponivel para controlar;
lotecontrolado:  lote disponivel para plantas , se houver;
loteguarda: lote disponivel para guarda;
lotefluxodigitalizafinalizado: lote processadoemtodas as esteiras;*/


created_at: {
  type: Sequelize.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
},
updated_at: {
  type: Sequelize.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
}
