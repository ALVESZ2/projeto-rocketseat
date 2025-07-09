const apiKeyInput = document.getElementById('apiKey'); //document.querySelector('#apiKey')
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const form = document.getElementById('form');
const iaResponse = document.getElementById('iaResponse');

const markdownToHTML = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text)
}

// AIzaSyDnVFkDayfTzYB_rynwGlsTfA6CxrNFsEk

const perguntarIA = async (question, game, apiKey) => { // diz que algum passo da funcao precisara sair da aplicacao e ir para outra aplicacao e espera alguma resposta
    const geminiModel = 'gemini-2.5-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
    const pergunta = `
        ## Especialidade
        Você é um especialista assistente de Meta para o jogo ${game}

        ## Tarefa
        Você deve responder às perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas

        ## Regras
        - Caso não saiba a resposta, limite-se a declarar ‘não sei’ e abstenha-se de formular informações imprecisas ou inventadas
        - Caso a pergunta não tenha relação com o jogo, limite-se a responder: ‘Essa pergunta não está relacionada ao jogo’
        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faca pesquisa atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente
        - NUnca responda itens que voce nao tenha certeza de que existe na versao atual

        ## Resposta
        - Economize na resposa, seja direto e responda no maximo 500 caracteres
        - responda em markdown
        - Sem saudacoes ou despedida,apenas responda oq o usuario pede, como se ele estivesse lendo um manual

        _____
        Aqui esta a pergunta do usuario: ${question}
    `

    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [
        {
            google_search: {}
        }
    ]

    // Chamada API
    const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const enviarForm = async (event) => {
    event.preventDefault();

    const apiKey = apiKeyInput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if (apiKey == '' || game == '' || question == "") {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true;
    askButton.textContent = 'Perguntando...';
    askButton.classList.add('loading');

    try {                                       //tentativa
        const text = await perguntarIA(question, game, apiKey);
        iaResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        iaResponse.classList.remove('hidden')

    } catch (error) {                            
        console.error('Error: ', error);
        iaResponse.querySelector('.response-content').innerHTML =
            '<p style="color:red;">Erro ao obter resposta da IA. Tente novamente mais tarde.</p>';
        iaResponse.classList.remove('hidden');
    } finally {                                 
        askButton.disabled = false;
        askButton.textContent = 'Perguntar';
        askButton.classList.remove('loading')
    }
};

form.addEventListener('submit', enviarForm); //"adicionar um ouvidor de eventos"