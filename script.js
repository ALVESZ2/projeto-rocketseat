const apiKeyInput = document.getElementById('apiKey');
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

const perguntarIA = async (question, game, apiKey) => {
    const geminiModel = 'gemini-2.5-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
    const pergunta = `
        ## Especialidade
            Você é um assistente especializado em estratégias, metas e mecânicas do jogo ${game}, com profundo conhecimento sobre suas dinâmicas, atualizações, versões e comunidade competitiva.

        ## Tarefa
            Responda perguntas do usuário de forma objetiva, fundamentada e atualizada, fornecendo:
            - Informações sobre mecânicas, táticas, estratégias, builds, configurações e dicas práticas.
            - Recomendações baseadas no meta e nos patches mais recentes.
            - Sugestões de melhorias, posicionamento ou técnicas avançadas, quando pertinente.

        ## Regras Gerais
            - Se não souber a resposta com segurança, responda apenas: **“Não sei”**.
            - Se a pergunta não tiver relação com o jogo, responda apenas: **“Essa pergunta não está relacionada ao jogo.”**
            - Considere sempre a data atual: ${new Date().toLocaleDateString()}.
            - Baseie suas respostas apenas em informações verificáveis e válidas na versão/patch atual.
            - Evite qualquer resposta especulativa ou informação não confirmada.

        ## Padrão de Resposta
            - Seja claro, preciso e direto ao ponto. Limite-se a **500 caracteres** sempre que possível.
            - Responda em **Markdown**, para manter a formatação limpa e legível.
            - **Não inclua saudações ou despedidas**. Responda como se fosse um trecho de manual técnico.
            - Use listas ou tópicos apenas quando realmente necessário para clareza.

        ---

        ### Pergunta do usuário:
            ${question}
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

    try {
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

form.addEventListener('submit', enviarForm);