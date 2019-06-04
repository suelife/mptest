const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const { HomeDeliveryDialog } = require("./homeDeliveryDialog")
const { SevenElevenDeliveryDialog } = require("./sevenElevenDeliveryDialog")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SHIPWAY_PROMPT = "shipwayPrompt"
const HOMEDELIVERY_PROMPT = "homedeliveryPrompt"
const SEVENELEVENDELIVERY_PROMPT = "sevenelevendeliveryPrompt"

class ShipwayDialog extends ComponentDialog {
    constructor(id, userProfileAccessor, conversationReferences) {
        super(id || SHIPWAY_PROMPT)

        this.userProfileAccessor = userProfileAccessor
        this.conversationReferences = conversationReferences

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new HomeDeliveryDialog(HOMEDELIVERY_PROMPT, this.userProfileAccessor))
            .addDialog(new SevenElevenDeliveryDialog(SEVENELEVENDELIVERY_PROMPT, this.userProfileAccessor, this.conversationReferences))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.ShipwayStep0.bind(this),
                this.ShipwayStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async ShipwayStep0(stepContext) {
        console.log("ShipwayStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        const shipWay = MessageFactory.suggestedActions(["宅配", "7-11", "全家"], `選擇取貨方式`);
        if (!userInfo.p_shipway) {
            return await stepContext.prompt(TEXT_PROMPT, shipWay)
        } else {
            return await stepContext.next()
        }
    }

    async ShipwayStep1(stepContext) {
        console.log("ShipwayStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.p_shipway === undefined && stepContext.result) {
            userInfo.p_shipway = stepContext.result
        }
        switch (userInfo.p_shipway) {
            case "宅配":
                userInfo.p_shipway_2_1 = 0
                return await stepContext.beginDialog(HOMEDELIVERY_PROMPT)
            case "7-11":
                userInfo.p_shipway_2_1 = 1
                return await stepContext.endDialog()
                // return await stepContext.beginDialog(SEVENELEVENDELIVERY_PROMPT)
                // await stepContext.context.sendActivity("非常抱歉，還在排除問題中")
                // await stepContext.context.sendActivity("會盡快修復")
                // await stepContext.context.sendActivity("將導向宅配服務")
                // return await stepContext.beginDialog(HOMEDELIVERY_PROMPT)
            case "全家":
                userInfo.p_shipway_2_1 = 2
                return await stepContext.endDialog()
            default:
                await stepContext.context.sendActivity("麻煩用選的，謝謝。")
                await stepContext.context.sendActivity("不然你別想完成交易 凸")
                userInfo.p_shipway = undefined
                return await stepContext.beginDialog(SHIPWAY_PROMPT)
        }
    }
}

module.exports.ShipwayDialog = ShipwayDialog