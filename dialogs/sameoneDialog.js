const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const { BuyerNameDialog } = require("./BuyerDialogs/buyerNameDialog")
const { BuyerPhoneDialog } = require("./BuyerDialogs/buyerPhoneDialog")
const { BuyerEmailDialog } = require("./BuyerDialogs/buyerEmailDialog")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SAMEONE_PROMPT = "sameonePrompt"
const BUYERNAME_PROMPT = "buyernamePrompt"
const BUYERPHONE_PROMPT = "buyerphonePrompt"
const BUYEREMAIL_PROMPT = "buyeremailPrompt"

class SameoneDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || SAMEONE_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new BuyerNameDialog(BUYERNAME_PROMPT, this.userProfileAccessor))
            .addDialog(new BuyerPhoneDialog(BUYERPHONE_PROMPT, this.userProfileAccessor))
            .addDialog(new BuyerEmailDialog(BUYEREMAIL_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.SameoneStep0.bind(this),
                this.SameoneStep1.bind(this),
                this.SameoneStep2.bind(this),
                this.SameoneStep3.bind(this),
                this.SameoneStep4.bind(this),
                this.SameoneStep5.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async SameoneStep0(stepContext) {
        console.log("SameoneStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        var sameone = MessageFactory.suggestedActions(["是", "否"], "收件人同購買人嗎?")
        if (!userInfo.s_o) {
            return await stepContext.prompt(TEXT_PROMPT, sameone)
        } else {
            return await stepContext.next()
        }
    }

    async SameoneStep1(stepContext) {
        console.log("SameoneStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.s_o === undefined && stepContext.result) {
            userInfo.s_o = stepContext.result
        }
        console.log("收件人同購買人: ", userInfo.s_o)

        switch (userInfo.s_o) {
            case "是":
                userInfo.b_name = userInfo.c_name
                userInfo.b_phone = userInfo.c_phone
                userInfo.b_email = userInfo.c_email
                return await stepContext.endDialog()
            case "否":
                return await stepContext.next()
            default:
                await stepContext.context.sendActivity("用選的，謝謝")
                userInfo.s_o = undefined
                return await stepContext.beginDialog(SAMEONE_PROMPT)
        }
    }

    async SameoneStep2(stepContext) {
        console.log("SameoneStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYERNAME_PROMPT)
    }

    async SameoneStep3(stepContext) {
        console.log("SameoneStep3")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYERPHONE_PROMPT)
    }

    async SameoneStep4(stepContext) {
        console.log("SameoneStep4")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYEREMAIL_PROMPT)
    }

    async SameoneStep5(stepContext) {
        console.log("SameoneStep5")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.endDialog()
    }
}

module.exports.SameoneDialog = SameoneDialog