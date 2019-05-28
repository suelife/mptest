const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt} = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const ProductInfo = require('../../lib/productInfo')
const StoreInfo = require('../../lib/storeInfo')

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const FIND_PROMPT = "findPrompt"

class FindDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || FIND_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.FindStpe.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async FindStpe(stepContext) {
        console.log("FindStpe")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        let pid = stepContext.context.activity.text
        let p_i_d
        let mid
        await stepContext.context.sendActivity("好的，正在幫您搜尋此商品...");
            await stepContext.context.sendActivities([
                { type: 'typing' },
                { type: 'delay', value: 1000 }
        ]);

        await ProductInfo.p(pid).then(function(value){
            if (value) {
                userInfo.p = value
                mid = value.mid
                if (userInfo.p.product_img_dot) {
                    p_i_d = value.product_img_dot
                } else {
                    p_i_d = null
                }
            } else {
                userInfo.p = null
                p_i_d = null
            }
        })

        await ProductInfo.p_d(pid).then(function(value){
            if (Object.keys(value).length === 0) {
                userInfo.p_detail = null
            } else {
                userInfo.p_detail = value
            }
        })

        if (p_i_d == null) {
            userInfo.p_img = null
            return await stepContext.endDialog()
        } else {
            await ProductInfo.b_i(p_i_d).then(function(value){
                if (Object.keys(value).length === 0) {
                    userInfo.p_img = null
                } else {
                    userInfo.p_img = value
                }
            })
        }

        await StoreInfo.m(mid).then(function(value){
            userInfo.m = value
        })
        return await stepContext.endDialog()
    }
}

module.exports.FindDialog = FindDialog