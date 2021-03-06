const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const express = require('express');
const open = require("open");

const postToSunTech = require("../../lib/postToSunTech")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const CONFIRMPAYMENT_PROMPT = "cofirmpaymentPrompt"

class ConfirmPaymentDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || CONFIRMPAYMENT_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.ConfirmPaymentStep0.bind(this),
                this.ConfirmPaymentStep1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async ConfirmPaymentStep0(stepContext) {
        console.log("ConfirmPaymentStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        let success = undefined
        await postToSunTech.post(userInfo).then(function (value) {
            if (value != "POST失敗") {
                success = value
            }
        })
        if (success) {
            userInfo.sun = JSON.parse(success).data
            // await stepContext.context.sendActivity(`post MP回傳結果 : ${JSON.parse(success).data}`)
            await stepContext.context.sendActivities([
                { type: 'typing' },
                { type: 'delay', value: 1000 }
            ]);
            await stepContext.context.sendActivity("非常感謝您的光臨")
            return await stepContext.next()
        } else {
            await stepContext.context.sendActivity("發生異常狀況，請關閉機器人。")
            return await stepContext.endDialog()
        }

    }

    async ConfirmPaymentStep1(stepContext) {
        console.log("ConfirmPaymentStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        console.log("userInfo.u_to : ", userInfo.u_to)
        console.log("userInfo.u_from : ", userInfo.u_from)
        console.log("userInfo.u_cid : ", userInfo.u_cid)
        console.log("userInfo.sun : ", userInfo.sun)
        await stepContext.context.sendActivity("點擊按鈕，您將前往付款畫面。")
        var gosuntechCard = CardFactory.adaptiveCard({
            "type": "AdaptiveCard",
            "actions": [
                {
                    "type": "Action.OpenUrl",
                    "title": "前往付款畫面",
                    "url": "https://mpbot9527.azurewebsites.net/api/tosuntech?cid=" + userInfo.u_cid +"&from=" + userInfo.u_from
                }
            ],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.0"
        })
        await stepContext.context.sendActivity({ attachments: [gosuntechCard] })
        // await stepContext.context.sendActivity(`顯示2: ${JSON.parse(userInfo.sun).data}`)
        return await stepContext.endDialog()
        // https://mpbot9527.azurewebsites.net
        // http://localhost:3978
    }
}

module.exports.ConfirmPaymentDialog = ConfirmPaymentDialog