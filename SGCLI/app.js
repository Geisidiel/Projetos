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
    res.render('login/login',{ message: "", type: "danger" });
});
app.get('/sistem', (req, res) => {
  res.render('homepage',{ message: "", type: "danger" });
});
//rotas login

app.get('/login',(req,res)=>{
  res.render('login/login', { message: "", type: "danger" })
})

app.get('/login', (req, res) => {
  res.render('login/login_user', { message: "" }); // sua view de login
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/sistem',
    failureRedirect: '/',
    failureFlash: true // se quiser usar flash message depois, coloca true
  })
);

// Logout
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
});
//usuarios
app.get('/novousuario',(req,res)=>{
  res.render('login/cadastrar_user' , { message: "", type: "danger" })
})

app.post('/novousuario', async (req, res) => {
  const { nome, sobrenome, senha, cpf } = req.body;

  try {
    // Verifica campos obrigatórios
    if (!nome || !sobrenome || !senha || !cpf) {
      return res.render('login/cadastrar_user', {
        message: "Informe todos os campos para realizar o cadastro",
        type: "danger"
      });
    }

    // Verifica se já existe usuário com esse CPF
    const usuarioExistente = await Usuario.findOne({ where: { cpf } });
    if (usuarioExistente) {
      return res.render('login/cadastrar_user', {
        message: "Usuário já cadastrado",
        type: "danger"
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

    return res.render('login/cadastrar_user', {
      message: "Novo usuário cadastrado com sucesso",
      type: "sucess" // <-- corrigido
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
     return res.render('tabela_usuarios',{Usuarios:user,message:"Registros carregadoscomsucesso", type:"sucess"})
    }else{
      return res.render('tabela_usuarios',{Usuarios:user,message:"Nãohá usuarios cadastrados", type:"danger"})
    }
  
  } catch (error) {
    return res.render('tabela_usuarios',{Usuarios:user,message:"Erro ao pesquisar usuarios", type:"danger"})
  }
})
//Cadastrar Cliente
app.get('/clientes',ensureAuthenticated ,(req,res)=>{
  Cliente.findAll({
    include: [
      { model: Usuario, attributes: ['nome'] },
  
    ]
  }).then( (cliente)=>{
    res.render('tabela_clientes',{ Clientes:cliente, message: "Registros carregados com sucesso ...", type: "sucess" })
  })
  
})
app.get('/novocliente',ensureAuthenticated ,(req, res)=>{
  res.render('cadastrar_cliente', {  message: "", type: "sucess" })
})
app.post('/novocliente',ensureAuthenticated , async (req, res) => {
  try {
    // Verifica se o campo 'cliente' está vazio
    if (!req.body.cliente || req.body.cliente.trim() === '') {
      return res.render('cadastrar_cliente', { message: "O campo cliente não pode estar vazio!", type: "danger" });
    }

    // Verifica se o valor do campo 'cliente' não é um número
    if (!isNaN(req.body.cliente)) {
      return res.render('cadastrar_cliente', { message: "O campo cliente não pode ser um número!", type: "danger" });
    }

    // Verifica se o cliente já existe
    const client = await Cliente.findOne({ where: { cliente: req.body.cliente ,  } });
    if (client) {
      return res.render('cadastrar_cliente', { message: "Cliente já cadastrado!", type: "danger" });
    } else {
      // Cria um novo cliente
      await Cliente.create({ cliente: req.body.cliente ,userId: req.user.id });
      return res.render('cadastrar_cliente', { message: "Cadastrado com sucesso!", type: "sucess" });
    }
  } catch (error) {
    console.log(error);
    return res.render('cadastrar_cliente', { message: "Erro ao cadastrar", error: error.message, type: "danger" });
  }
});

//cadastrar categoria
app.get('/cadastrarcategoria',ensureAuthenticated ,async(req,res)=>{
  Cliente.findAll().then((cl)=>{
    res.render('cadastrar_categoria',{Categoria:cl,message:"",type:""})
  })
})
app.post('/novacategoria', ensureAuthenticated, async (req, res) => {
  try {
    const categoriaInput = req.body.categoria;

    // Verifica se o campo 'categoria' está vazio
    if (!categoriaInput) {
      const cl = await Cliente.findAll();
      return res.render('cadastrar_categoria', {
        Categoria: cl,
        message: "O campo categoria não pode estar vazio!",
        type: "danger"
      });
    }

    // Verifica se o valor do campo 'categoria' não é um número
    if (!isNaN(categoriaInput)) {
      const cl = await Cliente.findAll();
      return res.render('cadastrar_categoria', {
        Categoria: cl,
        message: "O campo categoria não pode ser um número!",
        type: "danger"
      });
    }

    // Verifica se a categoria já existe
    const categoriaExistente = await Categoria.findOne({ where: { categoria: categoriaInput, userId: req.user.id } });

    if (categoriaExistente) {
      const cl = await Cliente.findAll();
      return res.render('cadastrar_categoria', {
        Categoria: cl,
        message: "Categoria já cadastrada!",
        type: "danger"
      });
    }

  
    // Cria uma nova categoria
    await Categoria.create({idcliente: req.body.idcliente , categoria: categoriaInput, userId: req.user.id });

    const cl = await Cliente.findAll(); // caso necessário para o render da próxima página
    return res.render('cadastrar_categoria', {
      Categoria: cl,
      message: "Cadastrado com sucesso!",
      type: "sucess"
    });


  } 
  catch (error) {
    console.error(error);
    const cl = await Cliente.findAll();
    return res.render('cadastrar_categoria', {
      Categoria: cl,
      message: "Erro ao cadastrar",
      error: error.message,
      type: "danger"
    });
  }
});

//cadastrar subcategoria
app.get('/cadastrarsubcategoria',ensureAuthenticated ,async(req,res)=>{
  Categoria.findAll().then((cate)=>{
    res.render('cadastrar_subcategoria',{Cate:cate,message:'',type:''})
  })
  
})

app.post('/novasubcategoria', ensureAuthenticated, async (req, res) => {
  try {
   //const subcategoria = req.body.subcategoria;
    
    // Validação: campo vazio
    if (!req.body.subcategoria) {
      const cate = await Categoria.findAll();
      return res.render('cadastrar_subcategoria', {
        Cate:cate,
        message: "O campo subcategoria não pode estar vazio!",
        type: "danger"
      });
    }

    // Validação: campo numérico
    if (!isNaN(req.body.subcategoria)) {
      const cate = await Categoria.findAll();
      return res.render('cadastrar_subcategoria', {
        Cate:cate,
        message: "O campo subcategoria não pode ser um número!",
        type: "danger"
      });
    }

    // Verificação de duplicata
    const s_subcategoria = await Subcategoria.findOne({ where: { subcategoria:req.body.subcategoria } });

    if (s_subcategoria) {
      const cate = await Categoria.findAll();
      return res.render('cadastrar_subcategoria', {
        Cate:cate,
        message: "Subcategoria já cadastrada!",
        type: "danger"
      });
    }


    // Criação da subcategoria
    await Subcategoria.create({ idcategoria: req.body.idcategoria,subcategoria: req.body.subcategoria , userId: req.user.id });

    const cate = await Categoria.findAll();
    return res.render('cadastrar_subcategoria', {
      Cate:cate,
      message: "Cadastrado com sucesso!",
      type: "sucess"
    });

  } catch (error) {
    const cate = await Categoria.findAll();
    return res.render('cadastrar_subcategoria', {
      Cate:cate,
      message: "Erro ao cadastrar",
      error: error.message,
      type: "danger"
    });
  }
});

//Cadastrar lote
app.get('/criarlote', ensureAuthenticated ,async(req,res)=>{
  res.render('cadastrar_lote', { message: "", type: "" })
})
app.get('/lotescadastrados',ensureAuthenticated ,async(req,res)=>{
  const lotes = await Lote.findAll({
    include: [
      { model: Usuario, attributes: ['nome'] }
    ]
  });
try {
  if(lotes){
    return res.render('tabela_lotes',{ Lotes:lotes,  message: "Registros carregados com sucesso..", type: "sucess" })
   }
  if(lotes.length === 0){
   return res.render('tabela_lotes',{ Lotes:lotes,  message: "Não há lotes cadastrados", type: "danger" })
  }
} catch (error) {
      return res.render('tabela_lotes',{ Lotes:lotes,  message: "Erro ao buscar registros", type: "danger" })
  }
});

app.post('/novolote', ensureAuthenticated ,async (req,res)=>{
  
  const lote = await Lote.findOne({ where: { n_lote: req.body.n_lote } });
  try {
    if (!req.body.n_lote) {
      return res.render('cadastrar_lote', { message: "Informe todos os campos!", type: "danger" });
     };
  
    if(lote){
      return res.render('cadastrar_lote', { message: "Lote ja cadastrado!", type: "danger" });
    } 
    else {
      await Lote.create({ n_lote: req.body.n_lote , userId: req.user.id });
      res.render('cadastrar_lote', { message: "Cadastrado com sucesso!", type: "sucess" });
    }
    
  } catch (error) {
    res.render('cadastrar_lote', { message: "Erro ao cadastrar",  type: "danger" });
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
    res.render('cadastrar_documento', {
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
    res.render('cadastrar_documento', { message: "Erro ao cadastrar", type: "danger"});
  }
});

app.post('/cadastrardocumento',ensureAuthenticated , async (req, res) => {
  try {
      // Verificação de campos obrigatórios
      if (!req.user.id | !req.body.clienteId || !req.body.categoriaId || !req.body.subcategoriaId || !req.body.lote || !req.body.tipodocumento || !req.body.volume  || !req.body.qtdfolhas || !req.body.descricao) {
          const [tipodocumento, cliente, lote] = await Promise.all([
              Tipodocumento.findAll(),
              Cliente.findAll(),
              Lote.findAll({where: { localidade: "lotedisponive" }})
          ]);
         
          // Renderiza a página novamente com a mensagem de erro
          res.render('cadastrar_documento', {
              message: "Preencha todos os campos!",
              type: "danger",
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
          res.render('cadastrar_documento', {
              message: "Documento cadastrado com sucesso!",
              type: "sucess",
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
  res.render('cadastrar_documento', {
      message: "Ocorreu um erro ao processar a requisição ",
      type: "danger",
      Td: tipodocumento,
      Cl: cliente,
      Lt: lote
  }); 
  
  }
});
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
    if (documento) {
      res.render('tabela_documentos_cadastrados', {
        message: "Registros carregados com sucesso",
        type: "sucess",
        Td: tipodocumento,
        Cl: cliente,
        Lt: lote,
        Cdr: documento
      });
    } else {
      res.render('tabela_documentos_cadastrados', {
        message: "Registros carregados com sucesso",
        type: "sucess",
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

    res.render('tabela_documentos_cadastrados', {
      message: "Erro ao carregar registros...",
      type: "danger",
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
      res.render('cadastrar_tipo_documento', { message: " Preencha todos os campos!", type: "danger" });
    };
    const client = await Tipodocumento.findOne({ where: { tipodocumento: req.body.tipodocumento } });
    if (client) {
      res.render('cadastrar_tipo_documento', { message: " Tipo de documento ja cadastrado!", type: "danger" });
    } else {
      await Tipodocumento.create({ tipodocumento: req.body.tipodocumento, userId: req.user.id  });
      res.render('cadastrar_tipo_documento', { message: "Cadastrado com sucesso!", type: "sucess" });
    }
    
  } catch (error) {
    console.log(error);
      res.render('cadastrar_tipo_documento', { message: "Erro ao cadastrar", error: error.message, type: "danger" });
  }
  
})
app.get('/criartipodocumento', ensureAuthenticated ,async(req,res)=>{
  res.render('cadastrar_tipo_documento', { message: "", type: ""})
  
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

    res.render('tabela_estrutura', {
      Estrutura: clientes,
      message: "Dados carregados com sucesso",
      type: "sucess"
    });
  } catch (err) {
    console.error(err);
    res.render('tabela_estrutura', {
      Estrutura: [],
      message: "Erro ao carregar dados",
      type: "danger"
    });
  }
});

//Coleta
app.get('/coletanoclient',ensureAuthenticated , async(req,res)=>{
  res.render('cadastrar_movimento_coleta', { message: "", type: ""})

})

app.post('/coletar',ensureAuthenticated , async(req,res)=>{
  try {
    if(!req.body.n_rfid){
      return res.render('cadastrar_movimento_coleta', { message: "Preencha todos os campos..", type: "danger"})
    };
    const rfid  = await Vincular.findAll({ where: { n_rfid: req.body.n_rfid } });
    if (rfid == null) {
      return res.render('cadastrar_movimento_coleta', { message: "A caixa informada não foi devidamente processada nas etapas: Finalizar-lote & Vincular-caixas ", type: "danger"})
    } else {
       Movimento.create({ n_rfid: req.body.n_rfid ,userId: req.user.id ,localidade: req.body.localidade });
       return res.render('cadastrar_movimento_coleta', { message: "Movimento de coleta cadastrado", type: "sucess"})

    }
  } catch (error) {
    return res.render('cadastrar_movimento_coleta', { message: "Erro aoprocessar solicitação", type: "danger"})
  }
})

//Receber
app.get('/recebimentoarmazem',ensureAuthenticated , async(req,res)=>{
  res.render('cadastrar_movimento_recebimento', { message: "", type: ""})
  
})

app.post('/recebimento',ensureAuthenticated , async(req,res)=>{
  try {
    const rfid  = await Movimento.findAll({ where: { n_rfid: req.body.n_rfid } });
    if(!req.body.n_rfid){
      return res.render('cadastrar_movimento_recebimento', { message: "Preencha todos os campos..", type: "danger"})
    };
    if (rfid) {
      return res.render('cadastrar_movimento_recebimento', { message: "A caixa infromada não foi devidamente processada na etapa de: coleta", type: "danger"})
    } else {
       Movimento.create({ n_rfid: req.body.n_rfid ,userId: req.user.id ,localidade: req.body.localidade });
       return res.render('cadastrar_movimento_recebimento', { message: "Movimento de coleta cadastrado", type: "danger"})

    }
  } catch (error) {
    return res.render('cadastrar_movimento_recebimento', { message: "Erro aoprocessar solicitação", type: "danger"})
  }

 
})

//Vincular caixa e lotes
app.get('/vincularlotecaixa', ensureAuthenticated ,async(req,res)=>{
try {
    const lotess =  await Lote.findAll({where: { localidade: "loteavincular" }});
  if (!lotess || lotess.length === 0) {
    res.render('cadastrar_vinculos',{ Lote:lotess,  message: "Não ha lotes disponiveis..", type: "danger" })
  } else {
    res.render('cadastrar_vinculos',{ Lote:lotess,  message: "Lotes carregados com sucesso..", type: "sucess" })

  }
} catch (error) {
  const lotess =  await Lote.findAll();
    res.render('cadastrar_vinculos',{ Lote:lotess,  message: "Erro ao buscar lotes..", type: "sucess" })
}
})

app.post('/criarvinculo', ensureAuthenticated, async (req, res) => {
  const lotess = await Lote.findAll({ where: { localidade: "loteavincular" } });
  try {
    
    if (!req.body.lote || !req.body.n_caixa || !req.body.n_caixa_secundary || !req.body.n_rfid) {
      return res.render('cadastrar_vinculos', {
        Lote: lotess,
        message: "Preencha todos os campos",
        type: "danger"
      });
    };
  
    // Cria o vínculo
    await Vincular.create({
      n_lote: req.body.lote,
      n_caixa:req.body.n_caixa,
      n_caixa_secundary:req.body.n_caixa_secundary,
      n_rfid:req.body.n_rfid,
      userId: req.user.id
    });

    // Atualiza o lote relacionado
    await Lote.update(
      { localidade: 'vinculado' }, // <<< aqui você define o que quer alterar
      { where: { id:req.body.lote} }     // <<< ou use { numero: n_lote } se for pelo número
    );
     const lotenew = await Lote.findAll({ where: { localidade: "loteavincular" } });  
      return res.render('cadastrar_vinculos', {
      Lote: lotenew,
      message: "Vinculado com sucesso",
      type: "sucess"
    });

  } catch (error) {
    console.error( error);
    return res.render('cadastrar_vinculos', {
      Lote: lotess,
      message: "Erro ao vincular",
      type: "danger"
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
      
        return res.render('cadastrar_movimento_classificacao', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"danger"})
    } else {
      return res.render('cadastrar_movimento_classificacao', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"sucess"})
    }
  } catch (error) {
    return res.render('cadastrar_movimento_classificacao', {Lt: lotes, message:"Erro ao processar", type:"danger"})
  }
})
app.post('/classificar',async(req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "vinculado"}});
  const idlote = req.body.lote
  try {
    if (!req.body.lote ||!req.body.localidade|| !req.body.qtdfolhas) {
      return res.render('cadastrar_movimento_classificacao', {Lt: lotes, message:"Preencha todos so campos!", type:"danger"})
    } else {
      const lotedb =  await Lote.findAll({where:{n_loteId:idlote }});
      if (lotedb) {
        return res.render('cadastrar_movimento_classificacao', {Lt: lotes, message:"Movimento ja cadastrado para este lote", type:"danger"})
      } else {
        Movifluxolote.create({
          n_loteId: req.body.lote,
          localidade: req.body.localidade,
          qtdfolhas: req.body.qtdfolhas,
          userId: req.user.id
        });
        await Lote.update(
          { localidade: 'loteclassificado' }, // <<< aqui você define o que quer alterar
          { where: { id:idlote} }     // <<< ou use { numero: n_lote } se for pelo número
        )
        .then(()=>{
        return res.render('cadastrar_movimento_classificacao', {Lt: lotes, message:"Cadastro de movimento lotes registrads com sucesso!", type:"sucess"})
      });
      }
      
    }
  } catch (error) {
    return res.render('cadastrar_movimento_classificacao', {Lt: lotes, message:"Erro ao registrar dados", type:"danger"})
  }
})

//preparacao
app.get('/preparar',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "loteclassificado"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('cadastrar_movimento_preparacao', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"danger"})
    } else {
      return res.render('cadastrar_movimento_preparacao', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"sucess"})
    }
  } catch (error) {
    return res.render('cadastrar_movimento_preparacao', {Lt: lotes, message:"Erro ao processar", type:"danger"})
  }
})
app.post('/preparar',ensureAuthenticated,async (req,res)=>{
  const id = req.body.lote
  try {
    if (req.body.lote) {      
      await Lote.update(
        { localidade: 'lotepreparado' }, // <<< aqui você define o que quer alterar
        { where: { id:id} }     // <<< ou use { numero: n_lote } se for pelo número
      );
      const lotes =  await Lote.findAll({where:{localidade: "loteclassificado"}});
      return res.render('cadastrar_movimento_preparacao', {Lt: lotes, message:"Lote preparado", type:"sucess"})
      
    } else {
      const lotes =  await Lote.findAll({where:{localidade: "loteclassificado"}});
      return res.render('cadastrar_movimento_preparacao', {Lt: lotes, message:"Lote não preparado", type:"danger"})
    }
  } catch (error) {
    const lotes =  await Lote.findAll({where:{localidade: "loteclassificado"}});
      return res.render('cadastrar_movimento_preparacao', {Lt: lotes, message:"Erro ao  preparar", type:"danger"})
  }
})
//digitalizar
app.get('/digitalizar',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "lotepreparado"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('cadastrar_movimento_digitalizado', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"danger"})
    } else {
      return res.render('cadastrar_movimento_digitalizado', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"sucess"})
    }
  } catch (error) {
    return res.render('cadastrar_movimento_digitalizado', {Lt: lotes, message:"Erro ao processar", type:"danger"})
  }
})
//controle
app.get('/controle',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "vinculado"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('cadastrar_movimento_controlado', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"danger"})
    } else {
      return res.render('cadastrar_movimento_controlado', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"sucess"})
    }
  } catch (error) {
    return res.render('cadastrar_movimento_controlado', {Lt: lotes, message:"Erro ao processar", type:"danger"})
  }
})
//plantas
app.get('/plantas',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "vinculado"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('cadastrar_movimento_plantas', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"danger"})
    } else {
      return res.render('cadastrar_movimento_plantas', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"sucess"})
    }
  } catch (error) {
    return res.render('cadastrar_movimento_plantas', {Lt: lotes, message:"Erro ao processar", type:"danger"})
  }
})
//guarda
app.get('/guarda',ensureAuthenticated,async (req,res)=>{
  const lotes =  await Lote.findAll({where:{localidade: "vinculado"}});
  try {
    if (!lotes || lotes.length === 0) {
        return res.render('cadastrar_movimento_guarda', {Lt: lotes, message:"Não há lotes disponiveis para processar", type:"danger"})
    } else {
      return res.render('cadastrar_movimento_guarda', {Lt: lotes, message:"Lotes disponiveis para processamento", type:"sucess"})
    }
  } catch (error) {
    return res.render('cadastrar_movimento_guarda', {Lt: lotes, message:"Erro ao processar", type:"danger"})
  }
})

//rota dos selects
app.get('/segundoselect',ensureAuthenticated ,async(req,res)=>{

  const id = req.query.id;  // Pega o ID do select1

  // Realiza a consulta no banco, baseado no ID
  const dadosSelect2 = await Categoria.findAll({ where: { idcliente: id } });

  // Retorna os dados para o AJAX
  res.json(dadosSelect2);
  console.log(dadosSelect2)

});

app.get('/terceiroselect',ensureAuthenticated ,async(req,res)=>{

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
app.get('/teste4',async (req,res)=>{

  const subcategoriaInput = req.body.subcategoria;

  // Verifica se o campo 'categoria' está vazio
     await Categoria.findAll()
    .then((cate)=>{
      res.render('cadastrar_subcategoria', {message:'' , Cate:cate })
    })
  
    
    
})
app.get('/teste5',async(req,res)=>{
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
app.get('/teste6',async(req,res)=>{
  const n_lote ='00000001';
  await Documento.findAll({where:{lote: n_lote}})
  //await Lote.findAll()
  .then((lote)=>{
    res.json(lote)
  })

})
app.get('/teste8', async (req, res) => {
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
app.get('/teste10',async(req,res)=>{
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



//config servidor
app.listen(port, '192.168.183.247', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});

