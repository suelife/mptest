// Import require Package
const { ActivityTypes, ActivityHandler, TurnContext } = require('botbuilder');
const { MainDialog } = require('../dialogs/mainDialog')

// Define the identifiers for our state property accessors.
const DIALOG_STATE_PROPERTY = "dialogstateproperty"
const USER_INFO_PROPERTY = "userinfoproperty"

// // await myBot.run(context);
class MpBot extends ActivityHandler {
    constructor(conversationState, userState, conversationReferences) {
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

        this.onConversationUpdate(async turnContext => {
            this.addConversationReference(turnContext.activity);
        });

        // User coming to the bot
        this.onMembersAdded(async turnContext => {

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
        })

        // User type something to bot
        this.onMessage(async turnContext => {
            console.log("bot run start")
            await mainDialog.run(turnContext)
            console.log("bot run end")

            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(turnContext, false);
            await this.userState.saveChanges(turnContext, false);
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

module.exports.MpBot = MpBot;
