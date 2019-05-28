// Import require Package
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const { FindDialog } = require("./ProductDialogs/findDialog")
const { CreateDialog } = require("./ProductDialogs/createDialog")
const { SpecificationDialog } = require("./ProductDialogs/specificationDialog")
const { ShipwayDialog } = require("./ShipwayDialogs/shipwayDialog")
const { ConsigneeNameDialog } = require("./ConsigneeDialogs/consigneeNameDialog")
const { ConsigneePhoneDialog } = require("./ConsigneeDialogs/consigneePhoneDialog")
const { ConsigneeEmailDialog } = require("./ConsigneeDialogs/consigneeEmailDialog")
const { SameoneDialog } = require("./sameoneDialog")
const { PaymentwayDialog } = require("./PaymentwayDialogs/paymentwayDialog")
const { OrderlistDialog } = require("./orderlistDialog")

const { UserInfo } = require('../Resource/userInfo')

// Define the property accessors.
const BOT_PROMPT = "botPrompt"
const MAIN_PROMPT = "mainPrompt"
const TEXT_PROMPT = "textprompt"
const NUMBER_PROMPT = "numberprompt"

const FIND_PROMPT = "findPrompt"
const CREATE_PROMPT = "createPrompt"
const SPECIFICATION_PROMPT = "specificationPrompt"
const SHIPWAY_PROMPT = "shipwayPrompt"
const CONSIGNEENAME_PROMPT = "consigneenamePrompt"
const CONSIGNEEPHONE_PROMPT = "consigneephonePrompt"
const CONSIGNEEEMAIL_PROMPT = "consigneeemailPrompt"
const SAMEONE_PROMPT = "sameonePrompt"
const PAYMENTWAY_PROMPT = "paymentwayPrompt"
const ORDERLIST_PROMPT = 'orderlistPrompt'

class MainDialog extends ComponentDialog {
    constructor(dialogStateAccessor, userProfileAccessor, conversationReferences) {
        super(MAIN_PROMPT)

        this.dialogStateAccessor = dialogStateAccessor
        this.userProfileAccessor = userProfileAccessor
        this.conversationReferences = conversationReferences

        // Create Prompt Dialog
        this.addDialog(new TextPrompt(TEXT_PROMPT))
        this.addDialog(new NumberPrompt(NUMBER_PROMPT))

        // Create WaterfallDialog
        this.addDialog(new FindDialog(FIND_PROMPT, this.userProfileAccessor))
            .addDialog(new CreateDialog(CREATE_PROMPT, this.userProfileAccessor))
            .addDialog(new SpecificationDialog(SPECIFICATION_PROMPT, this.userProfileAccessor))
            .addDialog(new ShipwayDialog(SHIPWAY_PROMPT, this.userProfileAccessor, this.conversationReferences))
            .addDialog(new ConsigneeNameDialog(CONSIGNEENAME_PROMPT, this.userProfileAccessor))
            .addDialog(new ConsigneePhoneDialog(CONSIGNEEPHONE_PROMPT, this.userProfileAccessor))
            .addDialog(new ConsigneeEmailDialog(CONSIGNEEEMAIL_PROMPT, this.userProfileAccessor))
            .addDialog(new SameoneDialog(SAMEONE_PROMPT, this.userProfileAccessor))
            .addDialog(new PaymentwayDialog(PAYMENTWAY_PROMPT, this.userProfileAccessor))
            .addDialog(new OrderlistDialog(ORDERLIST_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(BOT_PROMPT, [
                this.initializationStep.bind(this),
                this.mainStep0.bind(this),
                this.mainStep1.bind(this),
                this.mainStep2.bind(this),
                this.mainStep3.bind(this),
                this.mainStep4.bind(this),
                this.mainStep5.bind(this),
                this.mainStep6.bind(this),
                this.mainStep7.bind(this),
                this.mainStep8.bind(this),
                this.mainStep9.bind(this),
                this.mainStep10.bind(this),
            ]))

        // Set initialDialogId
        this.initialDialogId = BOT_PROMPT
    }

    async run(turnContext) {
        // Create DialogSet Object
        const dialogSet = new DialogSet(this.dialogStateAccessor)
        dialogSet.add(this)

        // Creates a dialog context
        const dialogContext = await dialogSet.createContext(turnContext)

        // ContinueDialog
        const result = await dialogContext.continueDialog()
        if (result.status === DialogTurnStatus.empty) {
            // BeginDialog
            await dialogContext.beginDialog(this.id)
        }
    }

    async initializationStep(stepContext) {
        console.log("initializationStep")
        let userInfo = await this.userProfileAccessor.get(stepContext.context)
        await this.userProfileAccessor.set(stepContext.context, new UserInfo())
        if (userInfo === undefined) {
            if (stepContext.options && stepContext.options.userInfo) {
                await this.userProfileAccessor.set(stepContext.context, stepContext.options.userInfo);
            } else {
                await this.userProfileAccessor.set(stepContext.context, new UserInfo());
            }
        }
        return await stepContext.next()
    }

    async mainStep0(stepContext) {
        console.log("mainStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        userInfo.u_to = stepContext.context.activity.recipient.id
        userInfo.u_from = stepContext.context.activity.from.id
        userInfo.u_cid = stepContext.context.activity.conversation.id
        userInfo.p_id = stepContext.context.activity.text
        console.log(`商品編號: ${userInfo.p_id}`)
        if (isNaN(userInfo.p_id)) {
            await stepContext.context.sendActivity("商品編號錯誤");
            await stepContext.context.sendActivity("請輸入正確商品編號");
            return await stepContext.endDialog("")
        } else {
            return await stepContext.beginDialog(FIND_PROMPT)
        }
    }

    async mainStep1(stepContext) {
        console.log("mainStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (!userInfo.p) {
            await stepContext.context.sendActivity("搜尋結果: 無此商品")
            await stepContext.context.sendActivity("請輸入正確商品編號");
            return stepContext.endDialog()
        } else {
            return await stepContext.beginDialog(CREATE_PROMPT)
        }
    }

    async mainStep2(stepContext) {
        console.log("mainStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.p_plan === undefined) {
            if (userInfo.m == undefined) {
                await stepContext.context.sendActivity(`趕快去看其他商品八`)
                await stepContext.context.sendActivity(`商家已死，別看啦朋友`)
                return await stepContext.endDialog()
            } else {
                await stepContext.context.sendActivity(`如需購買此商品`)
                await stepContext.context.sendActivity(`請與商家連絡了解詳情`)
                await stepContext.context.sendActivity(`商家連絡電話: ${userInfo.m.Mem_WebTel}`)
                return await stepContext.endDialog()
            }
        }
        if (userInfo.p.product_no_spec == "1") {
            return await stepContext.next()
        } else if (userInfo.p.product_no_spec == "0") {
            return await stepContext.beginDialog(SPECIFICATION_PROMPT)
        }
    }

    async mainStep3(stepContext) {
        console.log("mainStep3")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        console.log("總商品規格 : ", userInfo.p_format)
        return await stepContext.beginDialog(SHIPWAY_PROMPT)
    }

    async mainStep4(stepContext) {
        console.log("mainStep4")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        console.log("取貨方式 : ", userInfo.p_shipway)
        return await stepContext.beginDialog(CONSIGNEENAME_PROMPT)
    }

    async mainStep5(stepContext) {
        console.log("mainStep5")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CONSIGNEEPHONE_PROMPT)
    }

    async mainStep6(stepContext) {
        console.log("mainStep6")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CONSIGNEEEMAIL_PROMPT)
    }

    async mainStep7(stepContext) {
        console.log("mainStep7")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(SAMEONE_PROMPT)
    }

    async mainStep8(stepContext) {
        console.log("mainStep8")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(PAYMENTWAY_PROMPT)
    }

    async mainStep9(stepContext) {
        console.log("mainStep9")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(ORDERLIST_PROMPT)
    }

    async mainStep10(stepContext) {
        console.log("mainStep10")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        // await stepContext.context.sendActivity("付款完成!")
        // await stepContext.context.sendActivity(`感謝您的購買，我們已經將訂單通知寄送至${userInfo.c_email}`)
        // await stepContext.context.sendActivity("發貨後我們會再通知您。")
        // await stepContext.context.sendActivity("再次感謝您的購買，期待您下次光臨。")
        return await stepContext.endDialog()
    }
}

module.exports.MainDialog = MainDialog