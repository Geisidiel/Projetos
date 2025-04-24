//código que faz a manipulação do numeros de lotes
function editlote(){
  const input = document.getElementById('n_lote');

  input.addEventListener('input', function() {
    let valor = input.value;

    // Remove qualquer caractere que não seja número
    valor = valor.replace(/\D/g, '');

    // Preenche com zeros à esquerda até que o número tenha 8 dígitos
    if (valor.length <= 8) {
      valor = valor.padStart(8, '0');
    }

    // Atualiza o valor no campo de entrada
    input.value = valor;

    // Quando o número de dígitos for maior que 8, remove um zero da esquerda
    if (valor.length > 8) {
      valor = valor.slice(1); // Remove o primeiro zero
      input.value = valor;
    }
  });
}

window.onload = function () {
  // Verifica se a section existe e se não está vazia
  const section = document.getElementById('meuElemento');
  if (section && section.innerHTML.trim() !== "") {
    section.style.display = 'block';

    setTimeout(() => {
      section.style.display = 'none';
    }, 3000); // Esconde após 3 segundos
  }

  // Função do select na view de cadastro de comueno
  const select = document.getElementById('meuSelect');
  const input = document.getElementById('meuInput');

  //Esta função esta manipulandodiretamente o selec juntoaonuero de processos e descricao no text area

  const descricao = document.getElementById('descricao');

  // Objeto com as descrições correspondentes
  const descricoes = {
      "PROCESSO": "PROCESSO SEHAB Nº : ",
      "AVULSO": "DESCRICAO: ",
      "LIVRO": "PROJETO / BAIRRO / RELATORIO: ",
      "DIVERSOS": "PROJETO / BAIRRO / RELATORIO: ",
      "TERMO DE PERMISSAO DE USO": "PERMISSIONARIO:  -  REGIÃO:  - CPF: ",
      "TITULO DE CONCESSAO": "PERMISSIONARIO:   -  REGIÃO: -  CPF:",
      "PLANTAS": "PROJETO : ",
      "TID": "DESCRICAO: ",
      "PROJETOS": "PLANTAS MAPOTECA: "
  };

  // Função para atualizar a descrição e gerenciar o estado do input
  select.addEventListener('change', function() {
      let descricaoText = descricoes[select.value] || ''; // Obtém a descrição com base no valor do select
      
      if (select.value === 'PROCESSO') {
          input.disabled = false;  // Torna o input disponível
          input.value = '';        // Limpa o valor do input
          descricao.value = descricaoText;  // Exibe a descrição correspondente
      } else {
          input.disabled = false;   // Desabilita o input
          input.value = 'Não aplicado';  // Coloca o valor padrão no input
          descricao.value = descricaoText;  // Exibe a descrição correspondente
      }
  });

  // Atualiza a descrição com o valor do input quando "PROCESSO" for selecionado
  input.addEventListener('input', function() {
      if (select.value === 'PROCESSO') {
          descricao.value = descricoes['PROCESSO'] + input.value; // Adiciona o valor do input na descrição
      }
  });
}
  

//menu lateral
document.addEventListener('DOMContentLoaded', function() {
  const submenuItems = document.querySelectorAll('.has-submenu > a');

  submenuItems.forEach(item => {
      item.addEventListener('click', function(event) {
          event.preventDefault();
          const submenu = this.nextElementSibling;
          if (submenu && submenu.classList.contains('submenu')) {
              submenu.classList.toggle('active');

              // Fechar outros submenus abertos (opcional)
              submenuItems.forEach(otherItem => {
                  if (otherItem !== this) {
                      const otherSubmenu = otherItem.nextElementSibling;
                      if (otherSubmenu && otherSubmenu.classList.contains('submenu') && otherSubmenu.classList.contains('active')) {
                          otherSubmenu.classList.remove('active');
                      }
                  }
              });
          }
      });
  });
});


// A função será executada quando a página estiver completamente carregada

  // Quando o valor do select1 mudar
  document.getElementById('select1').addEventListener('change', function() {
    var idSelecionado = this.value;;
    

    if (idSelecionado) {
      fetch(`/segundoselect?id=${idSelecionado}`)
        .then(response => response.json())  // Converte a resposta para JSON
        .then(data => {
          var select2 = document.getElementById('select2');
          select2.innerHTML = '<option value="">Selecione uma opção</option>'; // Limpa as opções anteriores
          
          // Preenche o select2 com as novas opções
          data.forEach(function(item) {
            var option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.categoria;
            select2.appendChild(option);
          });
        })
        .catch(error => console.error('Erro ao carregar dados do select2:', error));
    } else {
      document.getElementById('select2').innerHTML = '<option value="">Selecione uma opção</option>';
    }
  });

  // Quando o valor do select2 mudar
  document.getElementById('select2').addEventListener('change', function() {
    var idSelecionado = this.value;
    

    if (idSelecionado) {
      fetch(`/terceiroselect?id=${idSelecionado}`)
        .then(response => response.json())  // Converte a resposta para JSON
        .then(data => {
          var select3 = document.getElementById('select3');
          select3.innerHTML = '<option value="">Selecione uma opção</option>'; // Limpa as opções anteriores
          
          // Preenche o select3 com as novas opções
          data.forEach(function(item) {
            var option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.subcategoria;
            select3.appendChild(option);
          });
        })
        .catch(error => console.error('Erro ao carregar dados do select3:', error));
    } else {
      document.getElementById('select3').innerHTML = '<option value="">Selecione uma opção</option>';
    }
  });

  // Se você quiser disparar a requisição AJAX manualmente assim que a página carregar
  document.getElementById('select1').dispatchEvent(new Event('change'));

  
// Função para adicionar o número ao textarea com a expressão
function adicionarProcesso() {
  // Obtendo os valores dos elementos
  const select = document.getElementById('meuSelect');
  const inputNumero = document.getElementById('meuInput');
  const textarea = document.getElementById('descricao');

  // Verificando se "PROCESSO" está selecionado
  if (select.value === "PROCESSO") {
    // Concatenando a expressão ao número digitado no input
    const numero = inputNumero.value;
    if (numero) {
      textarea.value = `PROCESSOS SEHAB Nº: ${numero}`;
    } else {
      textarea.value = '';  // Limpa o textarea caso o input esteja vazio
    }
  } else {
    textarea.value = '';  // Limpa o textarea se "PROCESSO" não estiver selecionado
  }
}

// Adicionando evento de escuta para quando o input ou o select mudar
document.getElementById('inputNumero').addEventListener('input', adicionarProcesso);
document.getElementById('selectProcesso').addEventListener('change', adicionarProcesso);
