const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const CONSIGNEENAME_PROMPT = "consigneenamePrompt"

class ConsigneeNameDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || CONSIGNEENAME_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.ConsigneeNameStep0.bind(this),
                this.ConsigneeNameStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async ConsigneeNameStep0(stepContext) {
        console.log("ConsigneeNameStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (!userInfo.c_name) {
            return await stepContext.prompt(TEXT_PROMPT, "收件人姓名是?")
        } else {
            return await stepContext.next()
        }
    }

    async ConsigneeNameStep1(stepContext) {
        console.log("ConsigneeNameStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.c_name === undefined && stepContext.result) {
            userInfo.c_name = stepContext.result
        }
        console.log("收件人姓名: ", userInfo.c_name)
        return await stepContext.endDialog()
    }
}

module.exports.ConsigneeNameDialog = ConsigneeNameDialog