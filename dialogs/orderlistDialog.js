const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const { PaymentDialog } = require("./PaymentDialogs/paymentDialog")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const ORDERLIST_PROMPT = 'orderlistPrompt'
const PAYMENT_PROMPT = "paymentPrompt"

class OrderlistDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || ORDERLIST_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new PaymentDialog(PAYMENT_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.OrderlistStep0.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async OrderlistStep0(stepContext) {
        console.log("OrderlistStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        let p_format = ""
        let count = 1
        if (userInfo.p.product_no_spec == "1") {
            p_format = "單品"
        } else if (userInfo.p.product_no_spec == "0") {
            userInfo.p_format.forEach(element => {
                p_format += ("第" + count + "組: " + element + "  ")
                count += 1
            });
        }

        let p_shipway_addr = ""
        if (userInfo.p_shipway == "宅配") {
            p_shipway_addr += userInfo.p_shipway_1_zip + " " + userInfo.p_shipway_1_2 + userInfo.p_shipway_1_3 + userInfo.p_shipway_1_4
        } else if (userInfo.p_shipway == "7-11" || userInfo.p_shipway == "全家") {
            p_shipway_addr += "門市將在付款畫面做選擇"
        }

        var orderlist = CardFactory.adaptiveCard({
            "type": "AdaptiveCard",
            "body": [
                {
                    "type": "TextBlock",
                    "size": "Large",
                    "weight": "Bolder",
                    "text": "訂單明細"
                },
                {
                    "type": "Container",
                    "items": [
                        {
                            "type": "TextBlock",
                            "size": "Medium",
                            "weight": "Bolder",
                            "text": "商品資訊:"
                        },
                        {
                            "type": "FactSet",
                            "facts": [
                                {
                                    "title": "商品名稱:",
                                    "value": userInfo.p.product_name
                                },
                                {
                                    "title": "方案:",
                                    "value": userInfo.p_plan
                                },
                                {
                                    "title": "規格:",
                                    "value": p_format
                                },
                                {
                                    "title": "金額:",
                                    "value": "$" + userInfo.p_price
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "items": [
                        {
                            "type": "TextBlock",
                            "size": "Medium",
                            "weight": "Bolder",
                            "text": "收件人資訊:"
                        },
                        {
                            "type": "FactSet",
                            "facts": [
                                {
                                    "title": "姓名:",
                                    "value": userInfo.c_name
                                },
                                {
                                    "title": "電話:",
                                    "value": userInfo.c_phone
                                },
                                {
                                    "title": "信箱:",
                                    "value": userInfo.c_email
                                }
                            ]
                        },
                        {
                            "type": "Container",
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "size": "Medium",
                                    "weight": "Bolder",
                                    "text": "購買人資訊:"
                                },
                                {
                                    "type": "FactSet",
                                    "facts": [
                                        {
                                            "title": "姓名:",
                                            "value": userInfo.b_name
                                        },
                                        {
                                            "title": "電話:",
                                            "value": userInfo.b_phone
                                        },
                                        {
                                            "title": "信箱:",
                                            "value": userInfo.b_email
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "items": [
                        {
                            "type": "FactSet",
                            "facts": [
                                {
                                    "title": "取貨方式:",
                                    "value": userInfo.p_shipway
                                },
                                {
                                    "title": "取貨地點:",
                                    "value": p_shipway_addr
                                },
                                {
                                    "title": "付款方式:",
                                    "value": userInfo.p_paymentway
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "items": [
                        {
                            "type": "TextBlock",
                            "size": "Medium",
                            "weight": "Bolder",
                            "text": "商家資訊:"
                        },
                        {
                            "type": "FactSet",
                            "facts": [
                                {
                                    "title": "商家名稱:",
                                    "value": userInfo.m.Mem_WebName
                                },
                                {
                                    "title": "商家電話:",
                                    "value": userInfo.m.Mem_WebTel
                                },
                                {
                                    "title": "商家信箱:",
                                    "value": userInfo.m.Mem_WebMail
                                },
                            ]
                        }
                    ]
                },
            ],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.0"
        })
        await stepContext.context.sendActivity("以下是您的訂單明細");
        await stepContext.context.sendActivities([
            { type: 'typing' },
            { type: 'delay', value: 1000 }
        ]);
        await stepContext.context.sendActivity({ attachments: [orderlist] });

        return await stepContext.beginDialog(PAYMENT_PROMPT)
    }
}

module.exports.OrderlistDialog = OrderlistDialog