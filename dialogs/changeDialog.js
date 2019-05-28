const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');

const { ConfirmPaymentDialog } = require("./PaymentDialogs/confirmPaymentDialog")
const { CreateDialog } = require("./ProductDialogs/createDialog")
const { SpecificationDialog } = require("./ProductDialogs/specificationDialog")

const { BuyerNameDialog } = require("./BuyerDialogs/buyerNameDialog")
const { BuyerPhoneDialog } = require("./BuyerDialogs/buyerPhoneDialog")
const { BuyerEmailDialog } = require("./BuyerDialogs/buyerEmailDialog")

const MAIN_PROMPT = "mainPrompt"
const PLAN_PROMPT = "planPrompt"
const FORMAT_PROMPT = "formatPrompt"
const CUSER_PROMPT = "cuserPrompt"
const BUSER_PROMPT = "buserPrompt"
const TEXT_PROMPT = 'textPrompt'

const CHANGE_PROMPT = "changePrompt"
const CONFIRMPAYMENT_PROMPT = "cofirmpaymentPrompt"
const CREATE_PROMPT = "createPrompt"
const SPECIFICATION_PROMPT = "specificationPrompt"
const ORDERLIST_PROMPT = 'orderlistPrompt'
const CONSIGNEENAME_PROMPT = "consigneenamePrompt"
const CONSIGNEEPHONE_PROMPT = "consigneephonePrompt"
const CONSIGNEEEMAIL_PROMPT = "consigneeemailPrompt"
const BUYERNAME_PROMPT = "buyernamePrompt"
const BUYERPHONE_PROMPT = "buyerphonePrompt"
const BUYEREMAIL_PROMPT = "buyeremailPrompt"
const SHIPWAY_PROMPT = "shipwayPrompt"
const PAYMENTWAY_PROMPT = "paymentwayPrompt"

class ChangeDialog extends ComponentDialog {
    constructor(id, userProfileAccessor) {
        super(id || CHANGE_PROMPT)

        this.userProfileAccessor = userProfileAccessor

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPaymentDialog(CONFIRMPAYMENT_PROMPT, this.userProfileAccessor))
            .addDialog(new CreateDialog(CREATE_PROMPT, this.userProfileAccessor))
            .addDialog(new SpecificationDialog(SPECIFICATION_PROMPT, this.userProfileAccessor))
            .addDialog(new BuyerNameDialog(BUYERNAME_PROMPT, this.userProfileAccessor))
            .addDialog(new BuyerPhoneDialog(BUYERPHONE_PROMPT, this.userProfileAccessor))
            .addDialog(new BuyerEmailDialog(BUYEREMAIL_PROMPT, this.userProfileAccessor))
            .addDialog(new WaterfallDialog(MAIN_PROMPT, [
                this.ChangeStep0.bind(this),
                this.ChangeStep1.bind(this),
                this.ChangeStep2.bind(this),
            ]))
            .addDialog(new WaterfallDialog(PLAN_PROMPT, [
                this.FormatStep0.bind(this),
                this.FormatStep1.bind(this),
            ]))
            .addDialog(new WaterfallDialog(FORMAT_PROMPT, [
                this.FormatStep1.bind(this),
            ]))
            .addDialog(new WaterfallDialog(CUSER_PROMPT, [
                this.CNameStep0.bind(this),
                this.CNameStep1.bind(this),
                this.CNameStep2.bind(this),
            ]))
            .addDialog(new WaterfallDialog(BUSER_PROMPT, [
                this.BNameStep0.bind(this),
                this.BNameStep1.bind(this),
                this.BNameStep2.bind(this),
            ]))

        this.initialDialogId = MAIN_PROMPT
    }

    async ChangeStep0(stepContext) {
        console.log("ChangeStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        const change = MessageFactory.suggestedActions(["修改方案", "修改規格", "修改收件人資訊", "修改購買人資訊", "修改取貨方式", "修改付款方式"], "請選擇要修改內容或顯示訂單明細")
        if (!userInfo.o_1) {
            return await stepContext.prompt(TEXT_PROMPT, change)
        } else {
            return await stepContext.next()
        }
    }

    async ChangeStep1(stepContext) {
        console.log("ChangeStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.o_1 === undefined && stepContext.result) {
            userInfo.o_1 = stepContext.result
        }
        console.log("userInfo.o_1: ", userInfo.o_1)
        switch (userInfo.o_1) {
            case "修改方案":
                userInfo.o_1 = undefined
                userInfo.p_plan = undefined
                userInfo.p_format = []
                return await stepContext.beginDialog(PLAN_PROMPT)
            case "修改規格":
                userInfo.o_1 = undefined
                if (userInfo.p.product_no_spec == "1") {
                    await stepContext.context.sendActivity("單品無規格可以修改")
                    return await stepContext.next()
                } else if (userInfo.p.product_no_spec == "0") {
                    userInfo.p_format = []
                    return await stepContext.beginDialog(FORMAT_PROMPT)
                }
            case "修改收件人資訊":
                userInfo.o_1 = undefined
                userInfo.c_name = undefined
                userInfo.c_phone = undefined
                userInfo.c_email = undefined
                return await stepContext.beginDialog(CUSER_PROMPT)
            case "修改購買人資訊":
                userInfo.o_1 = undefined
                userInfo.b_name = undefined
                userInfo.b_phone = undefined
                userInfo.b_email = undefined
                return await stepContext.beginDialog(BUSER_PROMPT)
            case "修改取貨方式":
                userInfo.o_1 = undefined
                userInfo.p_shipway = undefined
                userInfo.p_shipway_1_1 = undefined
                userInfo.p_shipway_1_2 = undefined
                userInfo.p_shipway_1_3 = undefined
                userInfo.p_shipway_1_4 = undefined
                userInfo.p_shipway_1_zip = undefined
                userInfo.p_shipway_2_1 = undefined
                userInfo.p_shipway_2_2 = undefined
                userInfo.p_shipway_2_3 = undefined
                userInfo.p_shipway_2_4 = undefined
                return await stepContext.beginDialog(SHIPWAY_PROMPT)
            case "修改付款方式":
                userInfo.o_1 = undefined
                userInfo.p_paymentway = undefined
                return await stepContext.beginDialog(PAYMENTWAY_PROMPT)
            default:
                await stepContext.context.sendActivity("拜託用選的OK?")
                userInfo.o_1 = undefined
                return await stepContext.beginDialog(CHANGE_PROMPT)
        }
    }

    async ChangeStep2(stepContext) {
        console.log("ChangeStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(ORDERLIST_PROMPT)
    }

    async FormatStep0(stepContext) {
        console.log("FormatStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CREATE_PROMPT)
    }

    async FormatStep1(stepContext) {
        console.log("FormatStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        if (userInfo.p.product_no_spec == "1") {
            return await stepContext.next()
        } else if (userInfo.p.product_no_spec == "0") {
            return await stepContext.beginDialog(SPECIFICATION_PROMPT)
        }
    }

    async CNameStep0(stepContext) {
        console.log("CNameStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CONSIGNEENAME_PROMPT)
    }

    async CNameStep1(stepContext) {
        console.log("CNameStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CONSIGNEEPHONE_PROMPT)
    }

    async CNameStep2(stepContext) {
        console.log("CNameStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(CONSIGNEEEMAIL_PROMPT)
    }

    async BNameStep0(stepContext) {
        console.log("BNameStep0")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYERNAME_PROMPT)
    }

    async BNameStep1(stepContext) {
        console.log("BNameStep1")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYERPHONE_PROMPT)
    }

    async BNameStep2(stepContext) {
        console.log("BNameStep2")
        const userInfo = await this.userProfileAccessor.get(stepContext.context)
        return await stepContext.beginDialog(BUYEREMAIL_PROMPT)
    }
}

module.exports.ChangeDialog = ChangeDialog