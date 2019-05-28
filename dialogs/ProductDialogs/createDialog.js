const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const CREATE_PROMPT = "createPrompt"

class CreateDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || CREATE_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.createStpe.bind(this),
                this.createStpe1.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async createStpe(stepContext) {
        console.log("createStpe")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)

        let n_img = "https://i.imgur.com/QfZ13jr.jpg"
        var imageCard = []
        if (!userInfo.p_img) {
            var img = CardFactory.heroCard(userInfo.p.product_name, [n_img])
            imageCard.push(img)
        } else {
            userInfo.p_img.forEach(function (val, index) {
                var url = val.img_url_l
                var img = CardFactory.heroCard(userInfo.p.product_name, [url])
                imageCard.push(img)
            })
        }
        const imageCards = MessageFactory.carousel(imageCard)
        await stepContext.context.sendActivity(imageCards);

        var p_contentCard = []
        if (userInfo.p.product_content == "null") {
            var p = CardFactory.heroCard("無商品介紹", [], [], { text: "無商品介紹" })
            p_contentCard.push(p)
        } else {
            let p_context = JSON.parse(userInfo.p.product_content)
            Object.keys(p_context).map(function (num, index) {
                var p_title = p_context[num].title
                var p_text = p_context[num].text
                var p = CardFactory.heroCard(p_title, [], [], { text: p_text }, { subtitle: "Azure??" })
                p_contentCard.push(p)
            })
        }
        const p_contentCards = MessageFactory.carousel(p_contentCard)
        await stepContext.context.sendActivity(p_contentCards);

        userInfo.p_plan_array = []
        if (userInfo.p.product_plan == "null" || userInfo.p.product_plan == "") {
            await stepContext.context.sendActivity("此商品有問題無法販售")
            return await stepContext.endDialog()
        } else {
            let p_plan = JSON.parse(userInfo.p.product_plan)
            if (userInfo.p_plan_array.length == 0) {
                Object.keys(p_plan).map(function (num, index) {
                    var p_title = p_plan[num].title
                    var p_price = p_plan[num].price
                    var p_combined = p_plan[num].combined
                    var planButton = p_combined + "入 " + p_title + " - $" + p_price + "元"
                    userInfo.p_plan_array.push(planButton)
                })
            }
            var p_subtract = userInfo.p.product_show_price - userInfo.p.product_real_price
            await stepContext.context.sendActivity(`原價${userInfo.p.product_show_price}元，優惠價${userInfo.p.product_real_price}元，現省${p_subtract}元`)
        }
        // const planCards = MessageFactory.suggestedActions(planCard, `趕快選擇想要的方案吧!!!`);
        const planCards = MessageFactory.attachment(
            CardFactory.heroCard(
                '',
                [],
                userInfo.p_plan_array
            )
        );
        if (!userInfo.p_plan) {
            await stepContext.context.sendActivity(planCards)
            return await stepContext.prompt(TEXT_PROMPT, "趕快選擇想要的方案吧!!!")
            // return await stepContext.prompt(TEXT_PROMPT, planCards)
        } else {
            return await stepContext.next()
        }
    }

    async createStpe1(stepContext) {
        console.log("createStpe1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (stepContext.result === undefined) {
            await stepContext.context.sendActivity(`如需購買此商品`)
            await stepContext.context.sendActivity(`請與商家連絡了解詳情`)
            await stepContext.context.sendActivity(`商家連絡電話: 09XXXXXXXX`)
            return await stepContext.endDialog()
        } else {
            if (userInfo.p_plan === undefined) {
                userInfo.p_plan = stepContext.result
            }
            if (userInfo.p_plan_array.includes(userInfo.p_plan)) {
                userInfo.p_format = []
                var re_Price_1 = /[$]\d+/
                var re_Price_2 = /\d+$/
                var re_Price = re_Price_1.exec(userInfo.p_plan)
                var productPrice = re_Price_2.exec(re_Price)
                var re_combined = /\d{1,4}/
                var product_combined = re_combined.exec(userInfo.p_plan)

                console.log(`選擇方案: ${userInfo.p_plan}`)
                userInfo.p_price = productPrice[0]
                userInfo.p_combined = product_combined[0]
                return await stepContext.endDialog()
            } else {
                await stepContext.context.sendActivity("請選擇我給的方案，感謝。")
                userInfo.p_plan = undefined
                return await stepContext.beginDialog(CREATE_PROMPT)
            }
        }
    }
}

module.exports.CreateDialog = CreateDialog