const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const SPECIFICATION_PROMPT = "specificationPrompt"

class SpecificationDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || SPECIFICATION_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.SpecificationStep0.bind(this),
                this.SpecificationStep1.bind(this),
                this.SpecificationStep2.bind(this)
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async SpecificationStep0(stepContext) {
        console.log("SpecificationStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        // console.log("userInfo.p_format_array : ", userInfo.p_format_array)
        userInfo.p_format_array = []
        if (userInfo.p_format_array.length == 0) {
            userInfo.p_detail.forEach(function (val, index) {
                var formatButton = val.product_spec1 + " " + val.product_spec2
                userInfo.p_format_array.push(formatButton)
            })
        }
        // const formatCards = MessageFactory.suggestedActions(formatCard, `共${userInfo.p_combined}組，請選擇第${userInfo.p_format.length + 1}組的規格`);
        const formatCards1 = MessageFactory.attachment(
            CardFactory.heroCard(
                "",
                [],
                userInfo.p_format_array
            )
        )
        await stepContext.context.sendActivity(formatCards1)
        // return await stepContext.prompt(TEXT_PROMPT, formatCards)
        return await stepContext.prompt(TEXT_PROMPT, `共${userInfo.p_combined}組，請選擇第${userInfo.p_format.length+1}組的規格`)
    }

    async SpecificationStep1(stepContext) {
        console.log("SpecificationStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        console.log("選擇規格 : ", stepContext.result)
        if (userInfo.p_format_array.includes(stepContext.result)) {
            userInfo.p_format.push(stepContext.result)
            return await stepContext.next()
        } else {
            await stepContext.context.sendActivity("用選的很難嗎?")
            return await stepContext.beginDialog(SPECIFICATION_PROMPT)
        }
    }

    async SpecificationStep2(stepContext) {
        console.log("SpecificationStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.p_format.length < (userInfo.p_combined * 1)) {
            return await stepContext.beginDialog(SPECIFICATION_PROMPT)
        } else {
            return await stepContext.endDialog()
        }
    }
}

module.exports.SpecificationDialog = SpecificationDialog