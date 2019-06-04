// Import require Package
const { ActivityTypes, ActivityHandler, TurnContext } = require('botbuilder');
const { MainDialog } = require('../dialogs/mainDialog')

// Define the identifiers for our state property accessors.
const DIALOG_STATE_PROPERTY = "dialogstateproperty"
const USER_INFO_PROPERTY = "userinfoproperty"

// // await myBot.run(context);
class MpBot extends ActivityHandler {
    constructor(storage, conversationState, userState, conversationReferences) {
        super()

        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');

        this.conversationState = conversationState
        this.userState = userState
        // Create our state property accessors.
        this.dialogStateAccessor = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userProfileAccessor = userState.createProperty(USER_INFO_PROPERTY);
        this.conversationReferences = conversationReferences;

        const mainDialog = new MainDialog(this.dialogStateAccessor, this.userProfileAccessor, this.conversationReferences)

        this.onConversationUpdate(async (turnContext, next) => {
            this.addConversationReference(turnContext.activity);
            await next();
        });

        // User coming to the bot
        this.onMembersAdded(async (turnContext, next) => {

            // User 頻道 turnContext._activity.channelId
            // User ID turnContext._activity.from.id
            // console.log("turnContext._activity : ", turnContext._activity)
            // await turnContext.sendActivity(`user_channelId: ${turnContext._activity.channelId}`)
            // await turnContext.sendActivity(`user_id: ${turnContext._activity.from.id}`)

            const membersAdded = turnContext.activity.membersAdded
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== turnContext.activity.recipient.id) {
                    await turnContext.sendActivity(`歡迎光臨`);
                }
            }
            await next();
        })

        // User type something to bot
        this.onMessage(async (turnContext, next) => {
            console.log("bot run start")
            await mainDialog.run(turnContext)
            console.log("bot run end")
            await logMessageText(storage, this.dialogStateAccessor, this.userProfileAccessor, turnContext);
            await next();

        })

        this.onDialog(async (turnContext, next) => {
            console.log("onDialog")
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(turnContext, false);
            await this.userState.saveChanges(turnContext, false);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        })

    }
    addConversationReference(activity) {
        console.log("-----------------------------------------------------------------")
        const conversationReference = TurnContext.getConversationReference(activity);
        // console.log("conversationReference : ", conversationReference)
        this.conversationReferences[conversationReference.conversation.id] = conversationReference;
        console.log("this.conversationReferences : ", this.conversationReferences)
        console.log("-----------------------------------------------------------------")
    }
}

async function logMessageText(storage, conversationData, userProfile, turnContext) {
    let utterance = turnContext.activity.text;
    console.log("===========================================")
    let botId = turnContext.activity.recipient.id;
    console.log("機器人 :", botId)
    let userId = turnContext.activity.from.id;
    console.log("使用者 :", userId)
    let conversationId = turnContext.activity.conversation.id;
    console.log("conversationId :", conversationId)
    console.log("conversationData: ", conversationData)
    console.log("userProfile: ", userProfile)
    console.log("===========================================")
    console.log("User typing : ", utterance)

    // var x = "UtteranceLogJS"

    // debugger;
    try {
        // Read from the storage.
        let storeItems = await storage.read([conversationId])
        console.log("storeItems : ", storeItems)

        // Check the result.
        if (typeof (storeItems[conversationId]) != 'undefined') {
            // The log exists so we can write to it.
            if (storeItems[conversationId].userId == userId) {
                storeItems[conversationId].turnNumber++;
                if (!userProfile.name) {
                    storeItems[conversationId].UtteranceList.push(utterance);
                } else {
                    storeItems[conversationId].Name = userProfile.name;
                    if (utterance != userProfile.name) {
                        storeItems[conversationId].UtteranceList.push(utterance);
                    }
                }

                // Gather info for user message.
                var storedString = storeItems[conversationId].UtteranceList.toString();
                var numStored = storeItems[conversationId].turnNumber;

                try {
                    await storage.write(storeItems)
                    // await turnContext.sendActivity(`${numStored}: The list is now: ${storedString}`);
                } catch (err) {
                    await turnContext.sendActivity(`Write failed of UtteranceLogJS: ${err}`);
                }
            }
        }
        else {
            // await turnContext.sendActivity(`Creating and saving new utterance log`);
            var turnNumber = 1;
            storeItems[conversationId] = { userId: [`${userId}`], botId: [`${botId}`], UtteranceList: [`${utterance}`], "eTag": "*", turnNumber }

            if (storeItems[conversationId].userId == userId) {
                // Gather info for user message.
                var storedString = storeItems[conversationId].UtteranceList.toString();
                var numStored = storeItems[conversationId].turnNumber;

                try {
                    await storage.write(storeItems)
                    // await turnContext.sendActivity(`${numStored}: The list is now: ${storedString}`);
                } catch (err) {
                    await turnContext.sendActivity(`Write failed: ${err}`);
                }
            }
        }
    }
    catch (err) {
        await turnContext.sendActivity(`Read rejected. ${err}`);
    }
}

module.exports.MpBot = MpBot;
