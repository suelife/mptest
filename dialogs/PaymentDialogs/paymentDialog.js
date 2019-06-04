const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const { ConfirmPaymentDialog } = require("./confirmPaymentDialog")
const { ChangeDialog } = require("../changeDialog")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const PAYMENT_PROMPT = "paymentPrompt"
const CONFIRMPAYMENT_PROMPT = "cofirmpaymentPrompt"
const CHANGE_PROMPT = "changePrompt"

class PaymentDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || PAYMENT_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPaymentDialog(CONFIRMPAYMENT_PROMPT, this.userProfileAccessor))
            .addDialog(new ChangeDialog(CHANGE_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.PaymentStep0.bind(this),
                this.PaymentStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async PaymentStep0(stepContext) {
        console.log("PaymentStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)

        if (userInfo.p_shipway != "宅配") {
            await stepContext.context.sendActivity("門市將在 (確認付款) 後做選擇")
        }
        const payfix = MessageFactory.suggestedActions(["確認付款", "修改訂單內容"], "請選擇確認付款或修改訂單內容")
        if (!userInfo.o) {
            return await stepContext.prompt(TEXT_PROMPT, payfix)
        } else {
            return await stepContext.next()
        }
    }

    async PaymentStep1(stepContext) {
        console.log("PaymentStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.o === undefined && stepContext.result) {
            userInfo.o = stepContext.result
        }
        console.log("userInfo.o : ", userInfo.o)
        switch (userInfo.o) {
            case "確認付款":
                userInfo.o = undefined
                return await stepContext.beginDialog(CONFIRMPAYMENT_PROMPT)
            case "修改訂單內容":
                userInfo.o = undefined
                return await stepContext.beginDialog(CHANGE_PROMPT)
            default:
                await stepContext.context.sendActivity("都叫你用選的了，你不選是幹嘛呢?")
                userInfo.o = undefined
                return await stepContext.beginDialog(PAYMENT_PROMPT)
        }
    }
}

module.exports.PaymentDialog = PaymentDialog