Passos: 

1º - Instalar:
        - nodejs
        - npm
        - botFrameworkEmulator

2º: Após as instalações, no diretório raiz (/Lanchonete-Bot) execute:
- npm install

3º: Faça uma cópia de .env.example e renomeie o arquivo apenas para .env
- No arquivo .env em atribua a LUIS_MODEL_URL a sua url de conexão do LUIS.

4º: Entre na pasta (src/Code): 
- execute: nodemon lanchoneteApp.js

5º - Abra o botFrameworkEmulator:
Procure por:
- File -> Open Bot -> em Bot URL insira: http://localhost:3978/api/messages -> connect

Pronto. Digite "oi" para testar. O bot deve responder com "Oi! Tudo bem? Em que posso ajudar?"
