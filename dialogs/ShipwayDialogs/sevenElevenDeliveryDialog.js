const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const express = require('express');
const app = express();

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SEVENELEVENDELIVERY_PROMPT = "sevenelevendeliveryPrompt"

class SevenElevenDeliveryDialog extends ComponentDialog {
    constructor(id, userProfileAccessor, conversationReferences) {
        super(id || SEVENELEVENDELIVERY_PROMPT)

        this.userProfileAccessor = userProfileAccessor
        this.conversationReferences = conversationReferences

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.SevenElevenDeliveryStep0.bind(this),
                this.SevenElevenDeliveryStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async SevenElevenDeliveryStep0(stepContext) {
        console.log("SevenElevenDeliveryStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        var go7_11Card = CardFactory.adaptiveCard({
            "type": "AdaptiveCard",
            "actions": [
                {
                    "type": "Action.OpenUrl",
                    "title": "選擇7-11門市",
                    "url": "http://localhost:3978/api/to7-11"
                }
            ],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.0"
        })
        await stepContext.context.sendActivity({ attachments: [go7_11Card] })
        if (!userInfo.p_shipway_2_1) {
            return await stepContext.prompt(TEXT_PROMPT)
        } else {
            return await stepContext.next()
        }
    }

    async SevenElevenDeliveryStep1(stepContext) {
        console.log("SevenElevenDeliveryStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        console.log("this.conversationReferences : ", this.conversationReferences)
        if (this.conversationReferences[userInfo.u_cid].data === undefined) {
            await stepContext.context.sendActivity("不選門市還想取貨阿")
            return await stepContext.beginDialog(SEVENELEVENDELIVERY_PROMPT)
        } else {
            console.log("請問是否正確 :", stepContext.result)
            if (stepContext.result == "是") {
                if (userInfo.p_shipway_2_1 === undefined && this.conversationReferences[userInfo.u_cid].data) {
                    userInfo.p_shipway_2_1 = this.conversationReferences[userInfo.u_cid].data
                    console.log("userInfo.p_shipway_2_1 :", userInfo.p_shipway_2_1)
                    userInfo.p_shipway_2_2 = userInfo.p_shipway_2_1.storeid
                    userInfo.p_shipway_2_3 = userInfo.p_shipway_2_1.storename
                    userInfo.p_shipway_2_4 = userInfo.p_shipway_2_1.storeaddress
                    return await stepContext.endDialog()
                }
            } else if (stepContext.result == "否") {
                await stepContext.context.sendActivity("請重新選擇門市")
                return await stepContext.beginDialog(SEVENELEVENDELIVERY_PROMPT)
            } else {
                await stepContext.context.sendActivity("不想確認就當你選錯")
                await stepContext.context.sendActivity("請重新選擇門市")
                return await stepContext.beginDialog(SEVENELEVENDELIVERY_PROMPT)
            }
        }
    }
}

module.exports.SevenElevenDeliveryDialog = SevenElevenDeliveryDialog