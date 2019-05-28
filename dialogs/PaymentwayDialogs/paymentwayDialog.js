const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const { HomeDeliveryPaymentWayDialog } = require("./homeDeliveryPaymentWayDialog")
const { SevenElevenDeliveryPaymentWayDialog } = require("./sevenElevenDeliveryPaymentWayDialog")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const PAYMENTWAY_PROMPT = "paymentwayPrompt"
const HOMEDELIVERYPAYMENTWAY_PROMPT = "homedeliverypaymentwayPrompt"
const SEVENELEVENDELIVERYPAYMENTWAY_PROMPT = "sevenelevendeliverypaymentwayPrompt"

class PaymentwayDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || PAYMENTWAY_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new HomeDeliveryPaymentWayDialog(HOMEDELIVERYPAYMENTWAY_PROMPT, this.userProfileAccessor))
            .addDialog(new SevenElevenDeliveryPaymentWayDialog(SEVENELEVENDELIVERYPAYMENTWAY_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.PaymentWayStep0.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async PaymentWayStep0(stepContext) {
        console.log("PaymentWayStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        switch (userInfo.p_shipway) {
            case "宅配":
                return await stepContext.beginDialog(HOMEDELIVERYPAYMENTWAY_PROMPT)
            case "7-11取貨":
                return await stepContext.beginDialog(SEVENELEVENDELIVERYPAYMENTWAY_PROMPT)
            default:
                return await stepContext.beginDialog(PAYMENTWAY_PROMPT)
        }
    }
}

module.exports.PaymentwayDialog = PaymentwayDialog