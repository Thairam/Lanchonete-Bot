require('dotenv-extended').load({
    path: '../../.env'
});

const pedido = {}

const moment = require("moment");
const builder = require("botbuilder");
const restify = require("restify");

const server = restify.createServer();

var vendas = {
    "Tapioca": 0,
    "Pizza": 0,
    "Suco": 0,
    "Batata Frita": 0,
    "Hamburger": 0,
    "X-Burger": 0,
    "Pastel": 0,
    "Sobremesa": 0
};

let connector = new builder.ChatConnector({
    appId: "",
    appPassword: ""
});

let bot = new builder.UniversalBot(connector);

let recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
let intents = new builder.IntentDialog({ recognizers: [recognizer] });

intents.matches("Reclamações", [
    session => {
        builder.Prompts.text(session, "Ok, qual seria a reclamação?");
    },

    (session, results) => {
        session.send("Sua reclamação foi registrada com sucesso, posso ajudar em algo mais?")
    }
]);

intents.matches("Saudar", (session, results) => {
    session.send("Oi! Tudo bem? Em que posso ajudar?");
});

intents.matches("Pedir", [
    (session, args, next) => {
        var lanches = [
            "Tapioca",
            "Pizza",
            "Suco",
            "Batata Frita",
            "Hamburger",
            "X-Burger",
            "Pastel",
            "Sobremesa"
        ];

        let entityLanche = builder.EntityRecognizer.findEntity(args.entities, "Lanche");

        if (entityLanche) {
            var match = builder.EntityRecognizer.findBestMatch(lanches, entityLanche.entity);
        }

        if (!match) {
            const bestSeller = Object.entries(vendas).reduce((e1, e2) => e1[1] > e2[1] ? e1 : e2);

            builder.Prompts.choice(session, "No momento só temos esses lanches disponíveis. Qual que você gostaria de pedir?", lanches, {
                retryPrompt: 'Escolha uma das opções abaixo. Uma sugestão seria **' + bestSeller[0] + '**',
                maxRetries: 5
            });
        } else {
            next({ response: match });
        }
    },

    (session, results) => {
        pedido.item = results.response.entity;
        builder.Prompts.text(session, "Qual o endereco de entrega?")
    },

    (session, results) => {
        pedido.endereco = results.response;

        if (results.response) {
            var time = moment().add(30, "m");

            session.dialogData.time = time.format("HH:mm");
            session.send("Pronto! Seu lanche **%s** chegará às **%s**.", pedido.item, session.dialogData.time);
            session.send('O endereço de entrega é: **%s**.', pedido.endereco)
            session.send('**Obrigado pela preferência!!!**')

            vendas[pedido.item]++;
        } else {
            session.send("Sem problemas! Pode pedir numa próxima vez! :D");
        }
    }
]);

intents.matches("Cancelar", (session, results) => {
    session.send("Pedido cancelado com sucesso! Muito Obrigado! Até a próxima!");
});

intents.matches("Verificar", (session, results) => {
    session.send("Seu lanche chegará às **%s**", session.dialogData.time);
});

intents.matches("Finalizar", (session, results) => {
    session.send("Muito obrigado, até a próxima");
});

intents.matches("Funcionamento", (session, results) => {
    session.send("Nós funcionamos de 9h às 23h durante todos os dias da semana");
});

intents.matches("Pagamento", (session) => {
    session.send("Aceitamos cartões de crédito e débito (todas as bandeiras)");
});

intents.matches("Entrega", (session) => {
    session.send("Entregamos em toda a cidade de Campina Grande, durante o horário de funcionamento");
});

intents.matches("Desconto", (session) => {
    session.send("Desconto de 10% apenas para aniversariantes com documentação presente");
});

let teste = intents.onDefault(
    builder.DialogAction.send("Desculpe! Mas, não entendi o que você quis pedir!")
);

bot.dialog("/", intents);

server.post("/api/messages", connector.listen());

server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log("Aplicação executando na porta %s", server.name, server.url);
});