const dotenv = require('dotenv');
const path = require('path');
const restify = require('restify');
const url = require("url");

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState , MessageFactory} = require('botbuilder');

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
const memoryStorage = new MemoryStorage()
conversationState = new ConversationState(memoryStorage)
userState = new UserState(memoryStorage)


// Create the main dialog.
const mpBot = new MpBot(conversationState, userState, conversationReferences);

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

server.get('/api/to7-11', async (req, res) => {
    var from = JSON.parse(Object.values(userState.storage.memory)[1]).userinfoproperty.u_from
    var to = JSON.parse(Object.values(userState.storage.memory)[1]).userinfoproperty.u_to
    var conversationId = JSON.parse(Object.values(userState.storage.memory)[1]).userinfoproperty.u_cid
    console.log("------------get--------------")
    // console.log("JSON.parse(Object.values(userState.storage.memory)[1]) : ", JSON.parse(Object.values(userState.storage.memory)[1]))
    console.log("Object.values(userState.storage.memory) : ", Object.values(userState.storage.memory))
    console.log("from: ", from)
    console.log("to: ", to)
    console.log("conversationId: ", conversationId)
    console.log("------------get--------------")
    var endpoint = "http://localhost:3978/api/notify"
    var notifyUrl = endpoint + "?from=" + from + "&to=" + to + "&conversationId=" + conversationId + "&id=50"
    var formdata
    var formdata1 = '<html><body><form name="form1" action="http://emap.shopping7.com.tw/emap/c2cemap.ashx" method="POST">\
                    <div>\
                        <input type="hidden" name="eshopid" value="004" /><!-- 1.固定帶004-->\
                        <input type="hidden" name="showtype" value="1" />\
                        <!--2.固定帶1-->\
                        <input type="hidden" name="tempvar" value="" />\
                        <!--3.商家自行運用-->\
                        <input type="hidden" name="url"'
    var url = 'value = ' + notifyUrl + ' />'
    var formdata2 = '<input type="submit" name="button" id="button" value="選擇7-11門市" />\
                            </div>\
                            </form>\
                            <script type="text/javascript">form1.submit();\
                            </script></body></html>'
    formdata = formdata1 + url + formdata2
    res.header('Content-Length');
    res.charSet('utf-8');
    res.write(formdata)
    res.end()
});

server.get('/api/tosuntech', async (req, res) => {
    var suntech = JSON.parse(Object.values(userState.storage.memory)[1]).userinfoproperty.sun
    res.header('Content-Length');
    res.charSet('utf-8');
    res.write('<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title></head><body>' + JSON.parse(suntech).data + '</body></html>')
    res.end()
});