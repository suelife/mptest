const dotenv = require('dotenv');
const path = require('path');
const restify = require('restify');
const url = require("url");

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState, MessageFactory } = require('botbuilder');
const { CosmosDbStorage } = require('botbuilder-azure')

// This bot's main dialog.
const { MpBot } = require('./bots/bot');

// Read botFilePath and botFileSecret from .env file
// Note: Ensure you have a .env file and include botFilePath and botFileSecret.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nurl: http://localhost:3978/api/messages`);
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
    // appId: endpointConfig.appId || process.env.microsoftAppID,
    // appPassword: endpointConfig.appPassword || process.env.microsoftAppPassword
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${error}`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
    await context.sendActivity(`${error}`);
};

// Create the Storage.
const conversationReferences = {};
let conversationState, userState

var storage = new CosmosDbStorage({
    serviceEndpoint: process.env.DB_SERVICE_ENDPOINT,
    authKey: process.env.AUTH_KEY,
    databaseId: process.env.DATABASE,
    collectionId: process.env.COLLECTION
})
const memoryStorage = new MemoryStorage()
// conversationState = new ConversationState(memoryStorage)
// userState = new UserState(memoryStorage)
conversationState = new ConversationState(storage)
userState = new UserState(storage)


// Create the main dialog.
const mpBot = new MpBot(storage, conversationState, userState, conversationReferences);

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        console.log("=======================================")
        console.log("index run start")
        await mpBot.run(context);
        console.log("index run end")
        console.log("=======================================")
    });
});

server.use(restify.plugins.bodyParser({ mapParams: true }));

server.post('/api/notify', async (req, res) => {
    console.log("========================================================================")
    // console.log("req.headers : ", req.headers)
    console.log("req.body : ", req.body)

    // console.log("req.params : ", req.params)
    console.log("========================================================================")

    var parsedUrl = url.parse(req.url, true);
    var from = parsedUrl.query.from;
    console.log("from : ", from)
    var to = parsedUrl.query.to;
    console.log("to : ", to)
    var conversationId = parsedUrl.query.conversationId;
    console.log("conversationId : ", conversationId)
    var id = parsedUrl.query.id;
    // JSON.parse(Object.values(userState.storage.memory)[1]).userinfoproperty.p_shipway_2_1 = req.body

    for (let conversationReference of Object.values(conversationReferences)) {
        console.log("conversationReference :", conversationReference)
        if (conversationReference.conversation.id == conversationId) {
            conversationReference.data = req.body
            // console.log("conversationReference.data :", conversationReference.data)
            await adapter.continueConversation(conversationReference, async turnContext => {
                console.log("mpBot: ", mpBot.userProfileAccessor.get(turnContext))
                var store = conversationReference.data.storename + " " + conversationReference.data.storeaddress
                const reply1 = MessageFactory.text('您選擇的門市資訊如下');
                const reply2 = MessageFactory.text(store);
                const chk = MessageFactory.suggestedActions(["是", "否"], "請問是否正確")
                reply1.from = { id: to };
                reply1.recipient = { id: from };
                reply2.from = { id: to };
                reply2.recipient = { id: from };
                chk.from = { id: to };
                chk.recipient = { id: from };
                await turnContext.sendActivity(reply1);
                await turnContext.sendActivity(reply2);
                await turnContext.sendActivity(chk);

            });
        }
    }

    res.write('<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title></head><body><h1>關閉此頁面</h1><script>window.opener = null;window.close();</script></body></html>');
    res.end()
});

server.get('/api/tosuntech', async (req, res) => {
    var parsedUrl = url.parse(req.url, true);
    var cid = parsedUrl.query.cid;
    var uid = parsedUrl.query.from;
    console.log("cid : ", cid)
    console.log("uid : ", uid)


    // Read from the storage.
    let storeItems = await storage.read([cid])
    console.log("storeItems : ", storeItems)

    var data

    // Check the result.
    if (typeof (storeItems[cid]) != 'undefined') {
        // The log exists so we can write to it.
        if (storeItems[cid].userId) {
            data = storeItems[cid].Sun
        }
    }

    // console.log("data : ", data)
    // console.log("userState.storage.memory : ", JSON.parse(Object.values(userState.storage.memory)[1]) = {})
    // var suntech = JSON.parse(Object.values(userState.storage.memory)[1]).userinfoproperty.sun
    // console.log("suntech : ", suntech)
    res.write('<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title></head><body>' + data + '</body></html>')
    res.end()
});