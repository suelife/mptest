const request = require("request")

function findFormat(userInfo) {
    let l = []
    userInfo.p_detail.forEach(function (val, index) {
        let check = val.product_spec1 + " " + val.product_spec2
        if (userInfo.p.product_no_spec == 1) {
            l.push(val.psid)
        } else {
            userInfo.p_format.forEach(element => {
                if (element == check) {
                    l.push(val.psid)
                }
            });
        }
    })
    console.log("規格代號: ", l)
    return l
}

function checkPaymentWay(userInfo) {
    let num
    console.log("userInfo.p_paymentway ", userInfo.p_paymentway)
    switch (userInfo.p_paymentway) {
        case "信用卡":
            num = 110
            return num
        case "超商條碼":
            num = 120
            return num
        case "超商代碼":
            num = 130
            return num
        case "7-11取貨付款":
            num = 200
            return num
        default:
            break;
    }
}

function createData_h(userInfo) {
    let d_h = {}
    let l = findFormat(userInfo)
    let pw = checkPaymentWay(userInfo)
    d_h.app = "bot"
    d_h.pid = userInfo.p_id
    d_h.product_plan = userInfo.p_combined
    for (let index = 0; index < (userInfo.p_combined * 1); index++) {
        var s = "product_plan_set_" + index.toString()
        if (userInfo.p.product_no_spec == 1) {
            d_h[s] = l[0]
        } else {
            d_h[s] = l[index]
        }
    }
    d_h.shipping_way = 10
    d_h.county = userInfo.p_shipway_1_2
    d_h.district = userInfo.p_shipway_1_3
    d_h.zipcode = userInfo.p_shipway_1_zip
    d_h.address = userInfo.p_shipway_1_4
    d_h.consignee_name = userInfo.c_name
    d_h.consignee_phone = userInfo.c_phone
    d_h.consignee_email = userInfo.c_email
    d_h.buyer_name = userInfo.b_name
    d_h.buyer_phone = userInfo.b_phone
    d_h.buyer_email = userInfo.b_email
    d_h.payment_way = pw
    d_h.method = "post"
    return d_h
}
function createData_7(userInfo) {
    let d_h = {}
    let l = findFormat(userInfo)
    let pw = checkPaymentWay(userInfo)
    d_h.app = "bot"
    d_h.pid = userInfo.p_id
    d_h.product_plan = userInfo.p_combined
    for (let index = 0; index < (userInfo.p_combined * 1); index++) {
        var s = "product_plan_set_" + index.toString()
        d_h[s] = l[index]
    }
    if (userInfo.p_paymentway == "7-11取貨付款") {
        d_h.shipping_way = 200
    } else {
        d_h.shipping_way = 100
    }

    // d_h.storeid = "890184"
    // d_h.storename = "神州門市"
    // d_h.storeaddress = "新北市八里區龍米路一段113號"
    d_h.cargoflag = userInfo.p_shipway_2_1
    // d_h.storeid = userInfo.p_shipway_2_2
    // d_h.storename = userInfo.p_shipway_2_3
    // d_h.storeaddress = userInfo.p_shipway_2_4
    d_h.consignee_name = userInfo.c_name
    d_h.consignee_phone = userInfo.c_phone
    d_h.consignee_email = userInfo.c_email
    d_h.buyer_name = userInfo.b_name
    d_h.buyer_phone = userInfo.b_phone
    d_h.buyer_email = userInfo.b_email
    d_h.payment_way = pw
    d_h.method = "post"
    return d_h
}

function createData_home(userInfo) {
    let d_h = {}
    let l = findFormat(userInfo)
    let pw = checkPaymentWay(userInfo)
    d_h.app = "bot"
    d_h.pid = userInfo.p_id
    d_h.product_plan = userInfo.p_combined
    for (let index = 0; index < (userInfo.p_combined * 1); index++) {
        var s = "product_plan_set_" + index.toString()
        d_h[s] = l[index]
    }
    if (userInfo.p_paymentway == "全家取貨付款") {
        d_h.shipping_way = 200
    } else {
        d_h.shipping_way = 100
    }

    // d_h.storeid = "890184"
    // d_h.storename = "神州門市"
    // d_h.storeaddress = "新北市八里區龍米路一段113號"
    d_h.cargoflag = userInfo.p_shipway_2_1
    // d_h.storeid = userInfo.p_shipway_2_2
    // d_h.storename = userInfo.p_shipway_2_3
    // d_h.storeaddress = userInfo.p_shipway_2_4
    d_h.consignee_name = userInfo.c_name
    d_h.consignee_phone = userInfo.c_phone
    d_h.consignee_email = userInfo.c_email
    d_h.buyer_name = userInfo.b_name
    d_h.buyer_phone = userInfo.b_phone
    d_h.buyer_email = userInfo.b_email
    d_h.payment_way = pw
    d_h.method = "post"
    return d_h
}

module.exports = {
    post: function (userInfo) {
        return new Promise(function (resolve, reject) {
            if (userInfo.p_shipway == "宅配") {
                var postData = createData_h(userInfo)
            } else if (userInfo.p_shipway == "7-11") {
                var postData = createData_7(userInfo)
            } else if (userInfo.p_shipway == "全家") {
                var postData = createData_home(userInfo)
            }
            console.log("postData : ", postData)
            request.post({
                url: 'https://www.mp-boss.com/ajax/payment/trade.php',
                headers: { 'content-type': 'multipart/form-data' },
                form: postData
            },
                function (err, response, body) {
                    console.log("body : ", body)
                    if (err) {
                        console.log('error:', err); // Print the error if one occurred
                        resolve("POST失敗")
                    } else {
                        resolve(body)
                        // if (JSON.parse(body).error == 0) {
                        //     // console.log('body:', body); // Print the HTML for the ReqRes homepage.
                        // } else {
                        //     resolve("POST失敗")
                        // }
                        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    }
                }
                );
        })
    },
}
