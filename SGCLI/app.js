const express = require('express');
const app = express();
const port = 4000;
const path = require('path');

//conexão com banco
const sequelize_db = require('./Banco/db')

//model carregados
const Movilotes = require('./Controler/model_movimento_lotes');
const Cliente =require('./Controler/model_criar_cliente');
const Lote =require('./Controler/model_criar_lote');
const Categoria =require('./Controler/model_criar_categoria');
const Subcategoria = require('./Controler/model_criar_subcategoria')
const Vincular =require('./Controler/model_criar_vinculos');
const Movimento= require('./Controler/model_movimento_caixas')
const Tipodocumento =require('./Controler/model_criar_tipodocumeno');
const Documento =require('./Controler/model_criar_cadastro_documento');
const Usuario = require('./Controler/model_criar_usuario')
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
require('./config/passaport')(passport); // <-- isso é ESSENCIAL aqui
const { ensureAuthenticated } = require('./middleware/auth');
const { console } = require('inspector');
const { type } = require('os');
const flash = require('connect-flash');
const vincular = require('./Controler/model_criar_vinculos');
const { verify } = require('crypto');
const Movifluxolote =require('./Controler/model_movimento_lotes');
const { Console } = require('console');
const movicaixa = require('./Controler/model_movimento_caixas');
const DB =require('./index/index');
const ExcelJS = require('exceljs');
const { Op, fn, col } = require('sequelize');


//Configs
//Criar sessão
app.use(session({
  secret: 'sua_chave_super_secreta',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 1000 * 60 * 10 // <-- 15 minutos de inatividade
  }
}));
/*app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  next();
});*/

app.use(passport.initialize());
app.use(passport.session());
// Middleware para analisar dados JSON
app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'src')));//pastas publicas staticas
app.use(express.urlencoded({ extended: true }));// captura dos dados
app.use((req, res, next) => {
  res.locals.usuarioLogado = req.user;
  next();
});//usuariologado


//relacionamentos

/*sequelize_db.sync()  // Use force: true apenas se você quiser resetar o banco
  .then(() => {
    console.log('Banco de dados sincronizado!');
  })
  .catch(err => {
    
    console.error('Erro ao sincronizar o banco de dados:', err);
})*/

// Rota raiz

app.get('/', (req, res) => {
    res.render('new/login',{ message: "", type: "" });
});
app.get('/sistem', (req, res) => {
  res.render('new/home',{ message: "", type: "" });
});
//rotas login

app.get('/login',(req,res)=>{
  res.render('new/login', { message: "", type: "danger" })
})

app.post('/login', (req, res, next) => {
  const { cpf, senha } = req.body;

  // Validação simples dos campos
  if (!cpf || !senha) {
    return res.render('new/login', {
      message: 'Preencha todos os campos.',
      type: 'alert alert-danger'
    });
  }

  // Autenticação com passport usando callback
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err); // erro interno
    }

    if (!user) {
      // Autenticação falhou, retorna mensagem personalizada
      return res.render('new/login', {
        message: info?.message || 'CPF ou senha inválidos.',
        type: 'alert alert-danger'
      });
    }

    // Autenticação bem-sucedida, faz login manualmente
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/sistem'); // redireciona ao sucesso
    });
  })(req, res, next);
});

// Logout
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
});
//usuarios
app.get('/novousuario',(req,res)=>{
  res.render('new/criar_usuario' , { message: "", type: "danger" })
})
app.post('/aprovarusuario/:id',async(req,res)=>{

   const { id } = req.params;
    const user = await Usuario.findAll()
  try {
   const atualizar =  await Usuario.update(
      { age: '1' },
      { where: { id } }
    );
    if (atualizar) {
      return res.redirect('/usuarios')
    } else {
      return res.render('new/tabela_usuario',{Usuarios:user,message:"Não foi possivel atualizar usuario", type:"alert alert-danger"})
      
    }
  } catch (error) {
   
      return res.render('new/tabela_usuario',{Usuarios:user,message:"Erro ao atualizar o usuario", type:"alert alert-danger"})

  }
   
})
app.post('/novousuario', async (req, res) => {
  const { nome, sobrenome, senha, cpf } = req.body;

  try {
    // Verifica campos obrigatórios
    if (!nome || !sobrenome || !senha || !cpf) {
      return res.render('new/criar_usuario', {
        message: "Informe todos os campos para realizar o cadastro",
        type: "alert alert-danger"
      });
    }

    // Verifica se já existe usuário com esse CPF
    const usuarioExistente = await Usuario.findOne({ where: { cpf } });
    if (usuarioExistente) {
      return res.render('new/criar_usuario', {
        message: "Usuário já cadastrado",
        type: "alert alert-danger"
      });
    }

    // Criptografa a senha antes de salvar
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria o novo usuário
    await Usuario.create({
      nome,
      sobrenome,
      senha: senhaHash,
      cpf
    });

    return res.render('new/login', {
      message: "Novo usuário cadastrado com sucesso",
      type: "alert alert-success" // <-- corrigido
    });

  } catch (error) {
    console.error(error); // log pra depuração
    return res.render('login/cadastrar_user', {
      message: "Erro ao cadastrar usuário, contate o adm do sistema",
      type: "danger"
    });
  }
});
app.get('/usuarios',ensureAuthenticated  ,async(req,res)=>{
  try {
    const user = await Usuario.findAll();
    if(user){
     return res.render('new/tabela_usuario',{Usuarios:user,message:"Registros carregados com sucesso", type:"alert alert-success"})
    }else{
      return res.render('new/tabela_usuari',{Usuarios:user,message:"Nãohá usuarios cadastrados", type:"alert alert-danger"})
    }
  
  } catch (error) {
    return res.render('new/tabela_usuari',{Usuarios:user,message:"Erro ao pesquisar usuarios", type:"alert alert-danger"})
  }
})

//Cadastrar Cliente
app.get('/clientes',ensureAuthenticated ,(req,res)=>{
  Cliente.findAll({
    include: [
      { model: Usuario, attributes: ['nome'] },
  
    ]
  }).then( (cliente)=>{
    res.render('new/tabela_cliente',{ Clientes:cliente, message: "Registros carregados com sucesso!", type: "alert alert-success" })
  })
  
})
app.get('/novocliente',ensureAuthenticated ,(req, res)=>{
  res.render('new/criar_cliente', {  message: "", type: "" })
})
app.post('/novocliente',ensureAuthenticated , async (req, res) => {
  try {
    // Verifica se o campo 'cliente' está vazio
    if (!req.body.cliente || req.body.cliente.trim() === '') {
      return res.render('cadastrar_cliente', { message: "O campo cliente não pode estar vazio!", type: "alert alert-danger" });
    }

    // Verifica se o valor do campo 'cliente' não é um número
    if (!isNaN(req.body.cliente)) {
      return res.render('new/criar_cliente', { message: "O campo cliente não pode ser um número!", type: "alert alert-danger" });
    }

    // Verifica se o cliente já existe
    const client = await Cliente.findOne({ where: { cliente: req.body.cliente ,  } });
    if (client) {
      return res.render('new/criar_cliente', { message: "Cliente já cadastrado!", type: "alert alert-danger" });
    } else {
      // Cria um novo cliente
      await Cliente.create({ cliente: req.body.cliente ,userId: req.user.id });
      return res.render('new/criar_cliente', { message: "Cadastrado com sucesso!", type: "alert alert-success" });
    }
  } catch (error) {
    console.log(error);
    return res.render('new/criar_cliente', { message: "Erro ao cadastrar", error: error.message, type: "alert alert-danger" });
  }
});

//cadastrar categoria
app.get('/cadastrarcategoria',ensureAuthenticated ,async(req,res)=>{
  Cliente.findAll().then((cl)=>{
    res.render('new/criar_categoria',{Cliente:cl,message:"",type:""})
  })
})
app.post('/novacategoria', ensureAuthenticated, async (req, res) => {
  try {
    const categoriaInput = req.body.categoria;

    // Verifica se o campo 'categoria' está vazio
    if (!categoriaInput) {
      const cl = await Cliente.findAll();
      return res.render('new/criar_categoria', {
        Cliente: cl,
        message: "O campo categoria não pode estar vazio!",
        type: "alert alert-danger"
      });
    }

    // Verifica se o valor do campo 'categoria' não é um número
    if (!isNaN(categoriaInput)) {
      const cl = await Cliente.findAll();
      return res.render('new/criar_categoria', {
        Cliente: cl,
        message: "O campo categoria não pode ser um número!",
        type: "alert alert-danger"
      });
    }

    // Verifica se a categoria já existe
    const categoriaExistente = await Categoria.findOne({ where: { categoria: categoriaInput } });

    if (categoriaExistente) {
      const cl = await Cliente.findAll();
      return res.render('new/criar_categoria', {
        Cliente: cl,
        message: "Categoria já cadastrada!",
        type: "alert alert-danger"
      });
    }


    // Cria uma nova categoria
    await Categoria.create({idcliente: req.body.clienteId , 
      categoria: categoriaInput, 
      userId: req.user.id });

    const cl = await Cliente.findAll(); // caso necessário para o render da próxima página
    return res.render('new/criar_categoria', {
      Cliente: cl,
      message: "Cadastrado com sucesso!",
      type: "alert alert-success"
    });


  } 
  catch (error) {
    console.error(error);
    const cl = await Cliente.findAll();
    return res.render('new/criar_categoria', {
      Cliente: cl,
      message: "Erro ao cadastrar",
      error: error.message,
      type: "alert alert-danger"
    });
  }
});

//cadastrar subcategoria
app.get('/cadastrarsubcategoria',ensureAuthenticated ,async(req,res)=>{
  Categoria.findAll().then((cate)=>{
    res.render('new/criar_subcategoria',{Categoria:cate,message:'',type:''})
  })
  
})

app.post('/novasubcategoria', ensureAuthenticated, async (req, res) => {
  try {
   //const subcategoria = req.body.subcategoria;
    
    // Validação: campo vazio
    if (!req.body.subcategoria) {
      const cate = await Categoria.findAll();
      return res.render('new/criar_subcategoria', {
        Categoria:cate,
        message: "O campo subcategoria não pode estar vazio!",
        type: "alert alert-danger"
      });
    }

    // Validação: campo numérico
    if (!isNaN(req.body.subcategoria)) {
      const cate = await Categoria.findAll();
      return res.render('new/criar_subcategoria', {
        Categoria:cate,
        message: "O campo subcategoria não pode ser um número!",
        type: "alert alert-danger"
      });
    }

    // Verificação de duplicata
    const s_subcategoria = await Subcategoria.findOne({ where: { subcategoria:req.body.subcategoria } });

    if (s_subcategoria) {
      const cate = await Categoria.findAll();
      return res.render('new/criar_subcategoria', {
        Categoria:cate,
        message: "Subcategoria já cadastrada!",
        type: "alert alert-danger"
      });
    }


    // Criação da subcategoria
    await Subcategoria.create({ idcategoria: req.body.categoriaId,
      subcategoria: req.body.subcategoria , 
      userId: req.user.id });

    const cate = await Categoria.findAll();
    return res.render('new/criar_subcategoria', {
      Categoria:cate,
      message: "Cadastrado com sucesso!",
      type: "alert alert-success"
    });

  } catch (error) {
    const cate = await Categoria.findAll();
    return res.render('new/criar_subcategoria', {
      Categoria:cate,
      message: "Erro ao cadastrar",
      error: error.message,
      type: "alert alert-danger"
    });
  }
});

//Cadastrar lote
app.get('/criarlote', ensureAuthenticated ,async(req,res)=>{
  res.render('new/criar_lote', { message: "", type: "" })
})
app.get('/lotescadastrados',ensureAuthenticated ,async(req,res)=>{
  const lotes = await Lote.findAll({
    include: [
      { model: Usuario, attributes: ['nome'] }
    ]
  });
try {
  if(lotes){
    return res.render('new/tabela_lotes',{ Lotes:lotes,  message: "Registros carregados com sucesso..", type: "alert alert-success" })
   }
  if(lotes.length === 0){
   return res.render('new/tabela_lotes',{ Lotes:lotes,  message: "Não há lotes cadastrados", type: "alert alert-danger" })
  }
} catch (error) {
      return res.render('new/tabela_lotes',{ Lotes:lotes,  message: "Erro ao buscar registros", type: "alert alert-danger" })
  }
});

app.post('/novolote', ensureAuthenticated ,async (req,res)=>{
  
  const lote = await Lote.findOne({ where: { n_lote: req.body.n_lote } });
  try {
    if (!req.body.n_lote) {
      return res.render('new/criar_lote', { message: "Informe todos os campos!", type: "alert alert-danger" });
     };
  
    if(lote){
      return res.render('new/criar_lote', { message: "Lote ja cadastrado!", type: "alert alert-danger" });
    } 
    else {
      await Lote.create({ n_lote: req.body.n_lote , userId: req.user.id });
      res.render('new/criar_lote', { message: "Cadastrado com sucesso!", type: "alert alert-success" });
    }
    
  } catch (error) {
    res.render('new/criar_lote', { message: "Erro ao cadastrar",  type: "alert alert-danger" });
    console.log(error);
    
  }
})

//cadastrar  documento
app.get('/cadastrardocumento',ensureAuthenticated , async (req, res) => {
  try {
    // Fetch all data asynchronously
    const [tipodocumento,cliente, lote] = await Promise.all([
      Tipodocumento.findAll(),
      Cliente.findAll(),
      Lote.findAll({where: { localidade: "lotedisponivel" }})
    ]);

    // Render the view with the fetched data
    res.render('new/criar_cadastro_documento', {
      message: "",
      type: "",
      Td: tipodocumento,
      Cl: cliente,
      Lt: lote,
    });
  } 
  catch (error) {
    const [tipodocumento,cliente, lote] = await Promise.all([
      Tipodocumento.findAll(),
      Cliente.findAll(),
      Lote.findAll({where: { localidade: "lotedisponivel" }})
    ]);

    console.error('Error fetching data:', error);
    res.render('new/criar_cadastro_documento', { message: "Erro ao cadastrar", type: "alert alert-danger"});
  }
});

app.post('/cadastrardocumento',ensureAuthenticated , async (req, res) => {
  try {
      // Verificação de campos obrigatórios
      if (!req.user.id | !req.body.clienteId || !req.body.categoriaId || !req.body.subcategoriaId || !req.body.lote || !req.body.tipodocumento || !req.body.volume  || !req.body.qtdfolhas || !req.body.descricao) {
          const [tipodocumento, cliente, lote] = await Promise.all([
              Tipodocumento.findAll(),
              Cliente.findAll(),
              Lote.findAll({where: { localidade: "lotedisponivel" }})
          ]);
         
          // Renderiza a página novamente com a mensagem de erro
          res.render('new/criar_cadastro_documento', {
              message: "Preencha todos os campos!",
              type: "alert alert-danger",
              Td: tipodocumento,
              Cl: cliente,
              Lt: lote
          });
      } else {
          // Criação do documento
          await Documento.create({
              clienteId: req.body.clienteId,
              categoriaId: req.body.categoriaId,
              subcategoriaId: req.body.subcategoriaId,
              loteId: req.body.lote,
              tipodocumento: req.body.tipodocumento,
              processo: req.body.processo,
              volume: req.body.volume,
              descricao: req.body.descricao,
              qtdfolhas: req.body.qtdfolhas,
              userId: req.user.id
          });

          // Redireciona ou renderiza uma página de sucesso
          res.render('new/criar_cadastro_documento', {
              message: "Documento cadastrado com sucesso!",
              type: "alert alert-success",
              Td: await Tipodocumento.findAll(),
              Cl: await Cliente.findAll(),
              Lt: await Lote.findAll({where: { localidade: "lotedisponivel" }})
          });
      }
  } catch (error) {

    const [tipodocumento, cliente, lote] = await Promise.all([
      Tipodocumento.findAll(),
      Cliente.findAll(),
      Lote.findAll({where: { localidade: "lotedisponive" }})
  ]);
  console.log(error)
  // Renderiza a página novamente com a mensagem de erro
  res.render('new/criar_cadastro_documento', {
      message: "Ocorreu um erro ao processar a requisição ",
      type: "alert alert-danger",
      Td: tipodocumento,
      Cl: cliente,
      Lt: lote
  }); 
  
  }
}
);
app.get('/documentoscatalogados',ensureAuthenticated , async (req, res) => {
  try {
    
    const [tipodocumento, cliente, lote, documento] = await Promise.all([
      Tipodocumento.findAll(),
      Cliente.findAll(),
      Lote.findAll(),
      Documento.findAll({
        include: [
          { model: Cliente, attributes: ['cliente'] },
          { model: Categoria, attributes: ['categoria'] },
          { model: Subcategoria, attributes: ['subcategoria'] },
          { model: Lote, attributes: ['n_lote'] },
          { model: Usuario, attributes: ['nome'] }
        ]
      }),
    ]);
    if (!documento) {
      res.render('new/tabela_documentos', {
        message: "Registros carregados com sucesso",
        type: "alert alert-danger",
        Td: tipodocumento,
        Cl: cliente,
        Lt: lote,
        Cdr: documento
      });
    } else {
      res.render('new/tabela_documentos', {
        message: "Registros carregados com sucesso",
        type: "alert alert-success",
        Td: tipodocumento,
        Cl: cliente,
        Lt: lote,
        Cdr: documento
      });
    }
   

  } catch (error) {
    
    const [tipodocumento, cliente, lote, documento] = await Promise.all([
      Tipodocumento.findAll(),
      Cliente.findAll(),
      Lote.findAll(),
      Documento.findAll({ include: [
        { model: Cliente, attributes: ['cliente'] },
        { model: Categoria, attributes: ['categoria'] },
        { model: Subcategoria, attributes: ['subcategoria'] },
        { model: Lote, attributes: ['n_lote'] },
        { model: Usuario, attributes: ['nome'] }
      ]}),
    ]);

    res.render('new/tabela_documento', {
      message: "Erro ao carregar registros...",
      type: "alert alert-danger",
      Td: tipodocumento,
      Cl: cliente,
      Lt: lote,
      Cdr: documento
    });
  }
});

//cadastrar tipo documento
app.post('/criartipodocumento',ensureAuthenticated ,async(req,res)=>{

  try {
    if(!req.body.tipodocumento){
      res.render('new/criar_tipo_documental', { message: " Preencha todos os campos!", type: "alert alert-danger" });
    };
    const client = await Tipodocumento.findOne({ where: { tipodocumento: req.body.tipodocumento } });
    if (client) {
      res.render('new/criar_tipo_documental', { message: " Tipo de documento ja cadastrado!", type: "alert alert-danger" });
    } else {
      await Tipodocumento.create({ tipodocumento: req.body.tipodocumento, userId: req.user.id  });
      res.render('new/criar_tipo_documental', { message: "Cadastrado com sucesso!", type: "alert alert-success" });
    }
    
  } catch (error) {
    console.log(error);
      res.render('new/criar_tipo_documental', { message: "Erro ao cadastrar", error: error.message, type: "alert alert-danger" });
  }
  
})
app.get('/criartipodocumento', ensureAuthenticated ,async(req,res)=>{
  res.render('new/criar_tipo_documental', { message: "", type: ""})
  
})
app.get('/tiposdocumentais',ensureAuthenticated , async(req,res)=>{
  await Tipodocumento.findAll({
    include: [
      { model: Usuario, attributes: ['nome'] }
    ]
  }).then((tipodoc)=>{
    res.render('tabela_tipo_documental', { Tipodocumental:tipodoc, message: "Dados carregados com sucesso..", type: "sucess"})
  })
  
})

//estrutura
app.get('/estruturacadastradas', ensureAuthenticated, async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [
        {
          model: Usuario,
          attributes: ['nome'], // ou cpf, email etc.
        },
        {
          model: Categoria,
          include: [
            {
              model: Subcategoria
            }
          ]
        }
      ]
    });

    res.render('new/tabela_estrutura', {
      Estrutura: clientes,
      message: "Dados carregados com sucesso!",
      type: "alert alert-success"
    });
  } catch (err) {
    console.error(err);
    res.render('new/tabela_estrutura', {
      Estrutura: [],
      message: "Erro ao carregar dados",
      type: "alert alert-danger"
    });
  }
});

//Coleta
app.get('/coletanoclient',ensureAuthenticated , async(req,res)=>{
  res.render('new/criar_coleta', { message: "", type: ""})

})

app.post('/coletar', ensureAuthenticated, async (req, res) => {
  try {
    const { n_rfid, localidade } = req.body;

    if (!n_rfid) {
      return res.render('new/criar_coleta', {
        message: "Preencha todos os campos.",
        type: "alert alert-danger"
      });
    }

    const rfid = await Vincular.findAll({ where: { n_rfid } });

    if (rfid.length === 0) {
      return res.render('new/criar_coleta', {
        message: "A caixa informada não foi devidamente processada nas etapas: Finalizar-lote & Vincular-caixas",
        type: "alert alert-danger"
      });
    }

    // Verifica se o RFID já foi coletado
    const coletado = await Movimento.findOne({ where: { n_rfid } });
    if (coletado) {
      return res.render('new/criar_coleta', {
        message: "Caixa já coletada!",
        type: "alert alert-danger"
      });
    }

    await Movimento.create({
      n_rfid,
      userId: req.user.id,
      localidade
    });

    return res.render('new/criar_coleta', {
      message: "Movimento de coleta cadastrado",
      type: "alert alert-success"
    });

  } catch (error) {
    console.error(error);
    return res.render('new/criar_coleta', {
      message: "Erro ao processar solicitação",
      type: "alert alert-danger"
    });
  }
});


//Receber
app.get('/recebimentoarmazem',ensureAuthenticated , async(req,res)=>{
  res.render('new/criar_recebimento', { message: "", type: ""})
  
})

app.post('/recebimento', ensureAuthenticated, async (req, res) => {
  try {
    const { n_rfid, localidade } = req.body;

    if (!n_rfid || !localidade) {
      return res.render('new/criar_recebimento', {
        message: "Preencha todos os campos.",
        type: "alert alert-danger"
      });
    }

    // Verifica se a caixa já foi coletada
    const caixaColetada = await movicaixa.findOne({ where: { n_rfid, localidade: 'caixacoletada' } });

    if (!caixaColetada) {
      return res.render('new/criar_recebimento', {
        message: "A caixa não está disponível para recebimento. Verifique se ela foi coletada.",
        type: "alert alert-danger"
      });
    }

    // Verifica se a caixa já foi recebida
    const caixaRecebida = await movicaixa.findOne({ where: { n_rfid, localidade: 'caixarecebida' } });

    if (caixaRecebida) {
      return res.render('new/criar_recebimento', {
        message: "Caixa já recebida.",
        type: "alert alert-danger"
      });
    }

    // Registrar novo movimento de recebimento
    await movicaixa.create({
      n_rfid,
      userId: req.user.id,
      localidade  // 'caixarecebida' vindo do formulário
    });

    return res.render('new/criar_recebimento', {
      message: "Movimento de recebimento cadastrado com sucesso.",
      type: "alert alert-success"
    });

  } catch (error) {
    console.error(error);
    return res.render('new/criar_recebimento', {
      message: "Erro ao processar solicitação.",
      type: "alert alert-danger"
    });
  }
});


//Vincular caixa e lotes
app.get('/vincularlotecaixa', ensureAuthenticated ,async(req,res)=>{
try {
    const lotess =  await Lote.findAll({where: { localidade: "loteavincular" }});
  if (!lotess || lotess.length === 0) {
    res.render('new/criar_vinculo',{ Lote:lotess,  message: "Não ha lotes disponiveis..", type: "alert alert-danger" })
  } else {
    res.render('new/criar_vinculo',{ Lote:lotess,  message: "Lotes carregados com sucesso..", type: "alert alert-success" })

  }
} catch (error) {
  const lotess =  await Lote.findAll();
    res.render('new/criar_vinculo',{ Lote:lotess,  message: "Erro ao buscar lotes..", type: "alert alert-success" })
}
})

app.post('/criarvinculo', ensureAuthenticated, async (req, res) => {
  const lotess = await Lote.findAll({ where: { localidade: "loteavincular" } });

  try {
    const { lote, n_caixa, n_caixa_secundary, n_rfid } = req.body;

    // Validação de campos obrigatórios
    if (!lote || !n_caixa || !n_caixa_secundary || !n_rfid) {
      return res.render('new/criar_vinculo', {
        Lote: lotess,
        message: "Preencha todos os campos",
        type: "alert alert-danger"
      });
    }

    // Verifica se já há mais de 3 vínculos para esse RFID
    const vinculados = await Vincular.findAll({ where: { n_rfid } });
    if (vinculados.length >= 3) {
      return res.render('new/criar_vinculo', {
        Lote: lotess,
        message: "O RFID já está vinculado a três lotes!",
        type: "alert alert-danger"
      });
    }

    // Cria o vínculo
    await Vincular.create({
      loteId: lote,
      n_caixa,
      n_caixa_secundary,
      n_rfid,
      userId: req.user.id
    });

    // Atualiza o lote relacionado
    await Lote.update(
      { localidade: 'vinculado' },
      { where: { id: lote } }
    );

    const lotenew = await Lote.findAll({ where: { localidade: "loteavincular" } });

    return res.render('new/criar_vinculo', {
      Lote: lotenew,
      message: "Vinculado com sucesso",
      type: "alert alert-success"
    });

  } catch (error) {
    console.error(error);
    return res.render('new/criar_vinculo', {
      Lote: lotess,
      message: "Erro ao vincular",
      type: "alert alert-danger"
    });
  }
});


// Rota para excluir
app.post('/deletar/:id', async (req, res) => {
  const { id } = req.params;
  await Usuario.destroy({ where: { id } });
  res.redirect('/');
});

// Rota para atualizar (enviada pelo formulário de edição)
app.post('/finalizarlote/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Lote.update(
      { localidade: 'loteavincular' },
      { where: { id } }
    );

    Lote.findAll({
      include: [
        { model: Usuario, attributes: ['nome'] }
      ]
    })
    .then((lote)=>{
      res.redirect('/lotescadastrados')
    })
  } catch (error) {
    console.error('Erro ao finalizar lote:', error);
    Lote.findAll({
      include: [
        { model: Usuario, attributes: ['nome'] }
      ]
    })
    .then((lote)=>{
      res.redirect('/lotescadastrados')
    })
  }
});

//rotas para digitalização

//classificação
app.get('/classificar',ensureAuthenticated,async (req,res)=>{
  
  const lotes =  await Lote.findAll({where:{localidade: "vinculado"}});
  console.log(lotes)
  try {
    if (!lotes || lotes.length === 0) {
      
        return res.render('new/criar_classificação', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"alert alert-danger"})
    } else {
      return res.render('new/criar_classificação', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"alert alert-success"})
    }
  } catch (error) {
    return res.render('new/criar_classificação', {Lt: lotes, message:"Erro ao processar", type:"alert alert-danger"})
  }
})
app.post('/classificar',async(req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "vinculado"}});
 
  const idlote = req.body.lote
  try {
    if (!req.body.lote ||!req.body.localidade|| !req.body.qtdfolhas) {
      return res.render('new/criar_classificação', {Lt: lotes, message:"Preencha todos so campos!", type:"alert alert-danger"})
    } else {
      const lotedb =  await Movifluxolote.findAll({where:{n_loteId:idlote }});
      if (lotedb.length > 0) {
        return res.render('new/criar_classificação', {Lt: lotes, message:"Movimento ja cadastrado para este lote", type:"alert alert-danger"})
      } else {
       await Movifluxolote.create({
          n_loteId: req.body.lote,
          localidade: req.body.localidade,
          qtdfolhas: req.body.qtdfolhas,
          userId: req.user.id
        });
        await Lote.update(
          { localidade: 'loteclassificado' }, // <<< aqui você define o que quer alterar
          { where: { id:idlote} }     // <<< ou use { numero: n_lote } se for pelo número
        )
        await Lote.findAll({where:{localidade: "vinculado"}})
        .then((lote)=>{
          return res.render('new/criar_classificação', {Lt: lote, message:"Cadastro de movimento lotes registrado com sucesso!", type:"alert alert-success"})
        })
      }
      
    }
  } catch (error) {
    return res.render('new/criar_classificação', {Lt: lotes, message:"Erro ao registrar dados", type:"alert alert-danger"})
  }
})
//preparacao
app.get('/preparar',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "loteclassificado"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('new/criar_preparacao', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"alert alert-danger"})
    } else {
      return res.render('new/criar_preparacao', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"alert alert-success"})
    }
  } catch (error) {
    return res.render('new/criar_preparacao', {Lt: lotes, message:"Erro ao processar", type:"alert alert-danger"})
  }
})
app.post('/preparar',async(req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "loteclassificado"}});
  const idlote = req.body.lote
  try {
    if (!req.body.lote ||!req.body.localidade|| !req.body.qtdfolhas) {
      return res.render('new/criar_preparacao', {Lt: lotes, message:"Preencha todos so campos!", type:"alert alert-danger"})
    } else {
       {
       await Movifluxolote.create({
          n_loteId: req.body.lote,
          localidade: req.body.localidade,
          qtdfolhas: req.body.qtdfolhas,
          userId: req.user.id
        });
        await Lote.update(
          { localidade: 'lotepreparado' }, // <<< aqui você define o que quer alterar
          { where: { id:idlote} }     // <<< ou use { numero: n_lote } se for pelo número
        )
         await Lote.findAll({where:{localidade: "loteclassificado"}})
        .then((lote)=>{
        return res.render('new/criar_preparacao', {Lt: lote, message:"Cadastro de movimento lotes registrado com sucesso!", type:"alert alert-success"})
      });
      }
      
    }
  } catch (error) {
    return res.render('new/criar_preparacao', {Lt: lotes, message:"Erro ao registrar dados", type:"alert alert-danger"})
  }
})
//digitalizar
app.get('/digitalizar',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "lotepreparado"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('new/criar_digitalização', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"alert alert-danger"})
    } else {
      return res.render('new/criar_digitalizaçãoo', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"alert alert-success"})
    }
  } catch (error) {
    return res.render('new/criar_digitalização', {Lt: lotes, message:"Erro ao processar", type:"alert alert-danger"})
  }
})
app.post('/digitalizar',async(req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "lotepreparado"}});
  const idlote = req.body.lote
  try {
    if (!req.body.lote ||!req.body.localidade|| !req.body.qtdfolhas) {
      return res.render('new/criar_digitalização', {Lt: lotes, message:"Preencha todos so campos!", type:"alert alert-danger"})
    } else {
       {
       await Movifluxolote.create({
        n_loteId: req.body.lote,
          localidade: req.body.localidade,
          qtdfolhas: req.body.qtdfolhas,
          userId: req.user.id
        });
        await Lote.update(
          { localidade: 'lotedigitalizado' }, // <<< aqui você define o que quer alterar
          { where: { id:idlote} }     // <<< ou use { numero: n_lote } se for pelo número
        )
        await Lote.findAll({where:{localidade: "lotepreparado"}})
        .then((lote)=>{
        return res.render('new/criar_digitalização', {Lt: lote, message:"Cadastro de movimento lotes registrado com sucesso!", type:"alert alert-success"})
      });
      }
      
    }
  } catch (error) {
    return res.render('new/criar_digitalização', {Lt: lotes, message:"Erro ao registrar dados", type:"alert alert-danger"})
  }
})
//controle
app.get('/controle',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "lotedigitalizado"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('new/criar_controle', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"alert alert-danger"})
    } else {
      return res.render('new/criar_controle', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"alert alert-success"})
    }
  } catch (error) {
    return res.render('new/criar_controle', {Lt: lotes, message:"Erro ao processar", type:"alert alert-danger"})
  }
})
app.post('/controle',async(req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "lotedigitalizado"}});
  const idlote = req.body.lote
  try {
    if (!req.body.lote ||!req.body.localidade|| !req.body.qtdfolhas) {
      return res.render('new/criar_controle', {Lt: lotes, message:"Preencha todos so campos!", type:"alert alert-danger"})
    } else {
       {
       await Movifluxolote.create({
        n_loteId: req.body.lote,
          localidade: req.body.localidade,
          qtdfolhas: req.body.qtdfolhas,
          userId: req.user.id
        });
        await Lote.update(
          { localidade: 'loteplantas' }, // <<< aqui você define o que quer alterar
          { where: { id:idlote} }     // <<< ou use { numero: n_lote } se for pelo número
        )
        await Lote.findAll({where:{localidade: "lotedigitalizado"}})
        .then((lote)=>{
        return res.render('new/criar_controle', {Lt: lote, message:"Cadastro de movimento lotes registrado com sucesso!", type:"alert alert-success"})
      });
      }
      
    }
  } catch (error) {
    return res.render('new/criar_controle', {Lt: lotes, message:"Erro ao registrar dados", type:"alert alert-danger"})
  }
})
//plantas
app.get('/plantas',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "loteplantas"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('new/criar_plantas', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"alert alert-dange"})
    } else {
      return res.render('new/criar_plantas', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"alert alert-success"})
    }
  } catch (error) {
    return res.render('new/criar_plantas', {Lt: lotes, message:"Erro ao processar", type:"alert alert-dange"})
  }
})
app.post('/plantas',async(req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "loteplantas"}});
  const idlote = req.body.lote
  try {
    if (!req.body.lote ||!req.body.localidade|| !req.body.qtdfolhas) {
      return res.render('new/criar_plantas', {Lt: lotes, message:"Preencha todos so campos!", type:"alert alert-dange"})
    } else {
       {
       await Movifluxolote.create({
        n_loteId: req.body.lote,
          localidade: req.body.localidade,
          qtdfolhas: req.body.qtdfolhas,
          userId: req.user.id
        });
        await Lote.update(
          { localidade: 'loteguarda' }, // <<< aqui você define o que quer alterar
          { where: { id:idlote} }     // <<< ou use { numero: n_lote } se for pelo número
        )
        await Lote.findAll({where:{localidade: "loteplantas"}})
        .then((lote)=>{
        return res.render('new/criar_plantass', {Lt: lote, message:"Cadastro de movimento lotes registrado com sucesso!", type:"alert alert-success"})
      });
      }
      
    }
  } catch (error) {
    return res.render('new/criar_plantas', {Lt: lotes, message:"Erro ao registrar dados", type:"alert alert-dange"})
  }
})
//guarda
app.get('/guarda',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "loteguarda"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('new/criar_guarda', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"alert alert-danger"})
    } else {
      return res.render('new/criar_guarda', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"alert alert-success"})
    }
  } catch (error) {
    return res.render('new/criar_guarda', {Lt: lotes, message:"Erro ao processar", type:"alert alert-danger"})
  }
})
app.post('/guarda',async(req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "loteguarda"}});
  const idlote = req.body.lote
  try {
    if (!req.body.lote ||!req.body.localidade|| !req.body.qtdfolhas) {
      return res.render('new/criar_guarda', {Lt: lotes, message:"Preencha todos so campos!", type:"alert alert-danger"})
    } else {
       {
       await Movifluxolote.create({
        n_loteId: req.body.lote,
          localidade: req.body.localidade,
          qtdfolhas: req.body.qtdfolhas,
          userId: req.user.id
        });
        await Lote.update(
          { localidade: 'loteindexado' }, // <<< aqui você define o que quer alterar
          { where: { id:idlote} }     // <<< ou use { numero: n_lote } se for pelo número
        )
        await Lote.findAll({where:{localidade: "loteguarda"}})
        .then((lote)=>{
        return res.render('new/criar_guarda', {Lt: lote, message:"Cadastro de movimento lotes registrado com sucesso!", type:"alert alert-success"})
      });
      }
      
    }
  } catch (error) {
    return res.render('new/criar_guarda', {Lt: lotes, message:"Erro ao registrar dados", type:"alert alert-danger"})
  }
})
//indexação
app.get('/indexacao',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "loteindexado"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('new/criar_indexacao', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"alert alert-danger"})
    } else {
      return res.render('new/criar_indexacao', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"alert alert-success"})
    }
  } catch (error) {
    return res.render('new/criar_indexacao', {Lt: lotes, message:"Erro ao processar", type:"alert alert-danger"})
  }
})
app.post('/indexacao',async(req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "loteguarda"}});
  const idlote = req.body.lote
  try {
    if (!req.body.lote ||!req.body.localidade|| !req.body.qtdfolhas) {
      return res.render('new/criar_indexacao', {Lt: lotes, message:"Preencha todos so campos!", type:"alert alert-danger"})
    } else {
       {
       await Movifluxolote.create({
        n_loteId: req.body.lote,
          localidade: req.body.localidade,
          qtdfolhas: req.body.qtdfolhas,
          userId: req.user.id
        });
        await Lote.update(
          { localidade: 'loteconferido' }, // <<< aqui você define o que quer alterar
          { where: { id:idlote} }     // <<< ou use { numero: n_lote } se for pelo número
        )
        await Lote.findAll({where:{localidade: "loteguarda"}})
        .then((lote)=>{
        return res.render('new/criar_indexacao', {Lt: lote, message:"Cadastro de movimento lotes registrado com sucesso!", type:"alert alert-success"})
      });
      }
      
    }
  } catch (error) {
    return res.render('new/criar_indexacao', {Lt: lotes, message:"Erro ao registrar dados", type:"alert alert-danger"})
  }
})
//conferencia
app.get('/conferencia',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "loteconferido"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('new/criar_guarda', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"alert alert-danger"})
    } else {
      return res.render('new/criar_guarda', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"alert alert-success"})
    }
  } catch (error) {
    return res.render('new/criar_guarda', {Lt: lotes, message:"Erro ao processar", type:"alert alert-danger"})
  }
})
app.post('/conferencia',async(req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "loteconferido"}});
  const idlote = req.body.lote
  try {
    if (!req.body.lote ||!req.body.localidade|| !req.body.qtdfolhas) {
      return res.render('new/criar_guarda', {Lt: lotes, message:"Preencha todos so campos!", type:"alert alert-danger"})
    } else {
       {
       await Movifluxolote.create({
        n_loteId: req.body.lote,
          localidade: req.body.localidade,
          qtdfolhas: req.body.qtdfolhas,
          userId: req.user.id
        });
        await Lote.update(
          { localidade: 'lotefinalizado' }, // <<< aqui você define o que quer alterar
          { where: { id:idlote} }     // <<< ou use { numero: n_lote } se for pelo número
        )
        await Lote.findAll({where:{localidade: "loteguarda"}})
        .then((lote)=>{
        return res.render('new/criar_guarda', {Lt: lote, message:"Cadastro de movimento lotes registrado com sucesso!", type:"alert alert-success"})
      });
      }
      
    }
  } catch (error) {
    return res.render('new/criar_guarda', {Lt: lotes, message:"Erro ao registrar dados", type:"alert alert-danger"})
  }
})



//Processamento de lote
app.get('/producaolotes',ensureAuthenticated, async(req,res)=>{
  const  movimentos = await Movifluxolote.findAll({include: [
    { model: Lote, attributes: ['n_lote'] },
    { model: Usuario, attributes: ['nome'] }
  ]});
  try {

   if (movimentos.length === 0) {
    return res.render('new/tabela_producao_lotes',{Movimentos:movimentos,message:"Registros não encontrados",type:"alert alert-danger"})
   } else {
    return res.render('new/tabela_producao_lotes',{Movimentos:movimentos,message:"Registros  encontrados",type:"alert alert-success"})
    
   }

  } catch (error) {
    return res.render('new/tabela_producao_lotes',{Movimentos:movimentos, message:"Erro ao processar",type:"alert alert-danger"})
    
  }
})
//Movimento de caixas
app.get('/movimentoscaixa',ensureAuthenticated, async(req,res)=>{
  const  movimentos = await movicaixa.findAll({include: [
       { model: Usuario, attributes: ['nome'] }
  ]});
  try {

   if (movimentos.length === 0) {
    return res.render('new/tabela_caixas',{Movimentos:movimentos,message:"Registros não encontrados",type:"alert alert-danger"})
   } else {
    return res.render('new/tabela_caixas',{Movimentos:movimentos,message:"Registros  encontrados",type:"alert alert-success"})
    
   }

  } catch (error) {
    return res.render('new/tabela_caixas',{Movimentos:movimentos, message:"Erro ao processar",type:"alert alert-danger"})
    
  }
})
//Relatorio geral unificado
app.get('/relatoriogeral',ensureAuthenticated, async(req,res)=>{
  
  const  movimentos = await DB.Documento.findAll({
    include: [
    {model: DB.vincular,as: 'vinculo'},
    { model: Cliente, attributes: ['cliente'] },
    { model: Categoria, attributes: ['categoria'] },
    { model: Subcategoria, attributes: ['subcategoria'] },
    { model: Lote, attributes: ['n_lote'] },
    { model: Usuario, attributes: ['nome'] }

    ]})
  try {

   if (movimentos.length === 0) {
    return res.render('new/tabela_documentos_geral',{Movimentos:movimentos,message:"Registros não encontrados",type:"alert alert-danger"})
   } else {
    return res.render('new/tabela_documentos_geral',{Movimentos:movimentos,message:"Registros  encontrados",type:"alert alert-success"})
    
   }

  } catch (error) {
    return res.render('new/tabela_documentos_geral',{Movimentos:movimentos, message:"Erro ao processar",type:"alert alert-danger"})
    
  }
})
//Faturamento
app.get('/faturamento',ensureAuthenticated, async(req,res)=>{
  res.render('new/faturamento',{message:"", type:""})
})
app.post('/consulta', async (req, res) => {
  const { data_inicio, data_fim } = req.body;

  if (!data_inicio || !data_fim) {
   return res.render('new/faturamento',{message:"O Campo data não pode ser vazio", type:"alert alert-danger"})
    
  }

  try {
     await Movilotes.findAll({
      attributes: [
        'localidade',
        [fn('SUM', col('qtdfolhas')), 'total_folhas']
      ],
      where: {
        createdAt: {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        },
        localidade: {
          [Op.in]: [
            'loteclasificado',
            'lotepreparado',
            'lotecontrolado',
            'lotedigitalizado',
            'loteindexado',
            'loteplantas',
            'lotepreparado'
          
          ]
        }
      },
      group: ['localidade']
    })
    .then((resultado)=>{
      return res.render('new/faturamento', { Resultado: resultado, data_inicio, data_fim,message:"Registros faturados", type:"alert alert-success" });
  
    })
  } catch (err) {
    console.error(err);
   return res.render('new/faturamento',{message:"Erro ao processa", type:"alert alert-danger"})
  }
});


//rota dos selects
app.get('/segundoselect' ,async(req,res)=>{

  const id = req.query.id;  // Pega o ID do select1

  // Realiza a consulta no banco, baseado no ID
  const dadosSelect2 = await Categoria.findAll({ where: { idcliente: id } });

  // Retorna os dados para o AJAX
  res.json(dadosSelect2);
  console.log(dadosSelect2)

});

app.get('/terceiroselect' ,async(req,res)=>{

  const id = req.query.id;  // Pega o ID do select1

  // Realiza a consulta no banco, baseado no ID
  const dadosSelect3 = await Subcategoria.findAll({ where: { idcategoria: id } });

  // Retorna os dados para o AJAX
  res.json(dadosSelect3);
  
})
app.get('/somafolhas/:loteId', ensureAuthenticated, async (req, res) => {
  try {
    const { loteId } = req.params;

    const soma = await Documento.sum('qtdfolhas', {
      where: { loteId: loteId }  // aqui você busca pelo id mesmo
    });
    console.log(soma);

    res.json({ total: soma || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar soma de folhas' });
  }
});
//rota para excels
app.get('/baixar-excel',ensureAuthenticated, async (req, res) => {
  const  relatorios = await DB.Documento.findAll({
    include: [
    {model: DB.vincular,as: 'vinculo'},
    { model: Cliente, attributes: ['cliente'] },
    { model: Categoria, attributes: ['categoria'] },
    { model: Subcategoria, attributes: ['subcategoria'] },
    { model: Lote, attributes: ['n_lote'] },
    { model: Usuario, attributes: ['nome'] }

    ]})

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Relatório');

  // Cabeçalho
  worksheet.columns = [
    { header: 'Cliente', key: 'cliente', width: 30 },
    { header: 'Categoria', key: 'categoria', width: 30 },
    { header: 'Subcategoria', key: 'subcategoria', width: 30 },
    { header: 'Lote', key: 'lote', width: 30 },
    { header: 'Tipo documental ', key: 'tipodocumento', width: 30 },
    { header: 'Processo', key: 'processo', width: 30 },
    { header: 'Volume', key: 'volume', width: 10 },
    { header: 'Descrição', key: 'descricao', width: 40 },
    { header: 'RFID', key: 'n_rfid', width: 15 },
    { header: 'Caixa ', key: 'n_caixa', width: 15 },
    { header: 'Caixa', key: 'n_caixa_secundary', width: 15 },
    { header: 'Usuário', key: 'usuario', width: 25 }
  ];

  // Dados
  relatorios.forEach(relatorio => {
    worksheet.addRow({
      cliente: relatorio.cliente.cliente,
      categoria: relatorio.categorium.categoria,
      subcategoria: relatorio.subcategorium.subcategoria,
      lote: relatorio.Lote.n_lote,
      tipodocumento: relatorio.tipodocumento,
      processo: relatorio.processo,
      descricao: relatorio.descricao,
      volume: relatorio.volume,
      n_rfid: relatorio.vinculo?.n_rfid || '',
      n_caixa: relatorio.vinculo?.n_caixa || '',
      n_caixa_secundary: relatorio.vinculo?.n_caixa_secundary || '',
      usuario: relatorio.User?.nome || ''
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=relatorio.xlsx');

  await workbook.xlsx.write(res);
  res.end();
  
});

//rotas para filtrar tabebla

//testes com rotas e json()
app.get('/testetabela', ensureAuthenticated , async(req ,res)=>{
  await Tipodocumento.findAll()
  .then((dados)=>{
    res.json(dados)
  })
})
app.get('/teste2', ensureAuthenticated ,async(req, res)=>{
  const clientes = await Cliente.findAll({
    include: [
      {
        model: Usuario,
        attributes: ['nome'], // ou cpf, email etc.
      },
      {
        model: Categoria,
        include: [
          {
            model: Subcategoria
          }
        ]
      }
    ]
  })
  .then((dados)=>{
    res.json(dados)
  })

})
app.get('/teste3', ensureAuthenticated ,async(req, res)=>{
   await Cliente.findAll({
    include: [
      { model: Usuario, attributes: ['nome'] },
      
    ]
  })
  .then((dados)=>{
    res.json(dados)
  })

})
app.get('/teste4',ensureAuthenticated,async (req,res)=>{

  const subcategoriaInput = req.body.subcategoria;

  // Verifica se o campo 'categoria' está vazio
     await Categoria.findAll()
    .then((cate)=>{
      res.render('cadastrar_subcategoria', {message:'' , Cate:cate })
    })
  
    
    
})
app.get('/teste5',ensureAuthenticated,async(req,res)=>{
  Tipodocumento.findAll({
    include: [
      { model: Usuario, attributes: ['nome'] }
    ]
  })
  .then((dados)=>{
    res.json(dados)
  })
})
app.get('/estruturacadastradas',ensureAuthenticated ,(req,res)=>{
  Documento.findAll({
    include: [
      { model: Cliente, attributes: ['cliente'] },
      { model: Categoria, attributes: ['categoria'] },
      { model: Subcategoria, attributes: ['subcategoria'] }
    ]
  })
  .then((estrutura)=>{
    //res.render('tabela_estrutura', {Estrutura: estrutura ,message: "Dados carregador com sucesso..", type: "sucess"})
    res.json(estrutura)
  })
})
//rota textEmphasisStyle
app.get('/teste6',ensureAuthenticated,async(req,res)=>{
  const n_lote ='00000001';
  await Documento.findAll({where:{lote: n_lote}})
  //await Lote.findAll()
  .then((lote)=>{
    res.json(lote)
  })

})
app.get('/teste8',ensureAuthenticated, async (req, res) => {
  const id = '1'; // Corrigido para string, pois o lote no banco parece estar como string

  try {
    const documentos = await Documento.findAll({ where: { id: id } });

    // Soma das folhas
    const totalFolhas = documentos.reduce((total, doc) => {
      return total + parseInt(doc.qtdfolhas, 10); // parseInt pois qtdfolhas é string
    }, 0);

    // Retorna tanto os documentos quanto a soma
    res.json({
      documentos,
      totalFolhas
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao consultar os documentos' });
  }
});
app.get('/teste10',ensureAuthenticated,async(req,res)=>{
await  Documento.findAll({
      include: [
        { model: Cliente, attributes: ['cliente'] },
        { model: Categoria, attributes: ['categoria'] },
        { model: Subcategoria, attributes: ['subcategoria'] },
        { model: Lote, attributes: ['n_lote'] },
        { model: Usuario, attributes: ['nome'] }
      ]
    })

  .then((documento)=>{
    res.json(documento)
  })
})
app.get('/teste11',ensureAuthenticated,async(req,res)=>{
   await Movifluxolote.findAll({include: [
    { model: Lote, attributes: ['n_lote'] },
    { model: Usuario, attributes: ['nome'] }
  ]})
    .then((documento)=>{
      res.json(documento)
    })
})
app.get('/teste12',async(req,res)=>{
   await DB.Documento.findAll({
    include: [
    {model: DB.vincular,as: 'vinculo'},
    { model: Cliente, attributes: ['cliente'] },
    { model: Categoria, attributes: ['categoria'] },
    { model: Subcategoria, attributes: ['subcategoria'] },
    { model: Lote, attributes: ['n_lote'] },
    { model: Usuario, attributes: ['nome'] }

    ]})
   .then((documento)=>{
     res.json(documento)
   })
})
app.get('/teste',async(req,res)=>{

    
  
    await Movilotes.findAll({
      attributes: [
        'localidade',
        [fn('SUM', col('qtdfolhas')), 'total_folhas']
      ],
      where: {
        createdAt: {
          [Op.between]: [new Date('2025-05-07'), new Date('2025-05-20')]
        },
        localidade: {
          [Op.in]: [  
            'loteclassificado',
            'lotepreparado',
            'lotecontrolado',
            'lotedigitalizado',
            'loteindexado',
            'loteplantas',
            'lotepreparado',
          ]
        }
      },
      group: ['localidade']
    })

    .then((documento)=>{
      res.json(documento)
    })
  
})

//config servidor
app.listen(port, '192.168.0.102', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});

