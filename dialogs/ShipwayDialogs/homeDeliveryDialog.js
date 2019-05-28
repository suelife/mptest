const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const TWzip = require("../../Resource/TWzipcode_20180607.json")

const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = 'textPrompt'
const HOMEDELIVERY_PROMPT = "homedeliveryPrompt"

var TW_Area = ["北部", "中部", "南部", "東部"]
var north = ["基隆市", "臺北市", "新北市", "桃園市", "宜蘭縣", "新竹市", "新竹縣"]
var middle = ["苗栗縣", "臺中市", "彰化縣", "南投縣", "雲林縣"]
var south = ["嘉義市", "嘉義縣", "臺南市", "高雄市", "屏東縣"]
var east = ["臺東縣", "花蓮縣"]

var Area = []

class HomeDeliveryDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || HOMEDELIVERY_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.HomeDeliveryStep0.bind(this),
                this.HomeDeliveryStep1.bind(this),
                this.HomeDeliveryStep2.bind(this),
                this.HomeDeliveryStep3.bind(this),
                this.HomeDeliveryStep4.bind(this)
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async HomeDeliveryStep0(stepContext) {
        console.log("HomeDeliveryStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        let TW
        let TWCard = []
        TW_Area.forEach(element => {
            switch (element) {
                case "北部":
                    TW = CardFactory.heroCard("", [], [element], { text: "基隆市，臺北市，新北市\n桃園市，宜蘭縣，新竹市，新竹縣" })
                    TWCard.push(TW)
                    break;
                case "中部":
                    TW = CardFactory.heroCard("", [], [element], { text: "苗栗縣，臺中市\n彰化縣，南投縣，雲林縣" })
                    TWCard.push(TW)
                    break;
                case "南部":
                    TW = CardFactory.heroCard("", [], [element], { text: "嘉義市，嘉義縣\n臺南市，高雄市，屏東縣" })
                    TWCard.push(TW)
                    break;
                case "東部":
                    TW = CardFactory.heroCard("", [], [element], { text: "臺東縣，花蓮縣" })
                    TWCard.push(TW)
                    break;
                default:
                    break;
            }
        });
        let TWCards = MessageFactory.carousel(TWCard)
        
        if (!userInfo.p_shipway_1_1) {
            await stepContext.context.sendActivity(TWCards)
            return await stepContext.prompt(TEXT_PROMPT, "請選擇區域")
        } else {
            return await stepContext.next()
        }
    }

    async HomeDeliveryStep1(stepContext) {
        console.log("HomeDeliveryStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.p_shipway_1_1 === undefined && stepContext.result) {
            userInfo.p_shipway_1_1 = stepContext.result
        }
        console.log("區域 : ", userInfo.p_shipway_1_1)
        if (TW_Area.includes(userInfo.p_shipway_1_1)) {
            let areaCard
            switch (userInfo.p_shipway_1_1) {
                case "北部":
                    areaCard = MessageFactory.attachment(
                        CardFactory.heroCard(
                            "",
                            [],
                            north
                        )
                    )
                    break;
                case "中部":
                    areaCard = MessageFactory.attachment(
                        CardFactory.heroCard(
                            "",
                            [],
                            middle
                        )
                    )
                    break;
                case "南部":
                    areaCard = MessageFactory.attachment(
                        CardFactory.heroCard(
                            "",
                            [],
                            south
                        )
                    )
                    break;
                case "東部":
                    areaCard = MessageFactory.attachment(
                        CardFactory.heroCard(
                            "",
                            [],
                            east
                        )
                    )
                    break;
                default:
                    break;
            }

            if (!userInfo.p_shipway_1_2) {
                await stepContext.context.sendActivity(areaCard)
                return await stepContext.prompt(TEXT_PROMPT, "請選擇縣市")
            } else {
                return await stepContext.next()
            }
        } else {
            await stepContext.context.sendActivity("選區域很難嗎?")
            userInfo.p_shipway_1_1 = undefined
            return await stepContext.beginDialog(HOMEDELIVERY_PROMPT)
        }
    }

    async HomeDeliveryStep2(stepContext) {
        console.log("HomeDeliveryStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.p_shipway_1_2 === undefined && stepContext.result) {
            userInfo.p_shipway_1_2 = stepContext.result
        }
        console.log("縣市 : ", userInfo.p_shipway_1_2)
        if (!north.includes(userInfo.p_shipway_1_2) && !middle.includes(userInfo.p_shipway_1_2) && !south.includes(userInfo.p_shipway_1_2) && !east.includes(userInfo.p_shipway_1_2)) {
            await stepContext.context.sendActivity("選的很難是不是?")
            userInfo.p_shipway_1_2 = undefined
            return await stepContext.beginDialog(HOMEDELIVERY_PROMPT)
        } else {

            TWzip.forEach(element => {
                if (element.City == userInfo.p_shipway_1_2) {
                    if (!Area.includes(element.Area)) {
                        Area.push(element.Area)
                    }
                }
            });
            const AreaCard = MessageFactory.attachment(
                CardFactory.heroCard(
                    "",
                    [],
                    Area
                )
            )
            
            if (!userInfo.p_shipway_1_3) {
                await stepContext.context.sendActivity(AreaCard)
                return await stepContext.prompt(TEXT_PROMPT, "請選擇鄉鎮市區")
            } else {
                return await stepContext.next()
            }
        }
    }

    async HomeDeliveryStep3(stepContext) {
        console.log("HomeDeliveryStep3")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.p_shipway_1_3 === undefined && stepContext.result) {
            userInfo.p_shipway_1_3 = stepContext.result
        }
        console.log("鄉鎮市區: ", userInfo.p_shipway_1_3)
        if (Area.includes(userInfo.p_shipway_1_3)) {
            Area = []

            TWzip.forEach(element => {
                if (element.City == userInfo.p_shipway_1_2 && element.Area == userInfo.p_shipway_1_3) {
                    if (userInfo.p_shipway_1_3 == element.Area) {
                        let re = /^\d{3}/
                        let zip3 = re.exec(element.Zip5)
                        userInfo.p_shipway_1_zip = zip3[0]
                    }
                }
            });

            if (!userInfo.p_shipway_1_4) {
                return await stepContext.prompt(TEXT_PROMPT, "請輸入其餘部分")
            } else {
                return await stepContext.next()
            }
        } else {
            await stepContext.context.sendActivity("到底想幹嘛?")
            await stepContext.context.sendActivity("用選的啦!!")
            userInfo.p_shipway_1_3 = undefined
            return await stepContext.beginDialog(HOMEDELIVERY_PROMPT)
        }
    }

    async HomeDeliveryStep4(stepContext) {
        console.log("HomeDeliveryStep4")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.p_shipway_1_4 === undefined && stepContext.result) {
            userInfo.p_shipway_1_4 = stepContext.result
        }
        console.log("其餘部分 : ", userInfo.p_shipway_1_4)
        return await stepContext.endDialog()
    }
}

module.exports.HomeDeliveryDialog = HomeDeliveryDialog