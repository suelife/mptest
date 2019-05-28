class UserInfo {
    constructor(
        u_to, u_from, u_cid,
        p_id, p, p_img, p_detail, p_plan_array, p_format_array,
        p_plan, p_price, p_combined,
        m,
        p_format, 
        p_shipway, p_shipway_1_1, p_shipway_1_2, p_shipway_1_3, p_shipway_1_4, p_shipway_1_zip,
        p_shipway_2_1, p_shipway_2_2, p_shipway_2_3, p_shipway_2_4,
        c_name, c_phone, c_email,
        s_o,
        b_name, b_phone, b_email,
        p_paymentway,
        o, o_1, sun
    ) {
        this.u_to = u_to || undefined;
        this.u_from = u_from || undefined;
        this.u_cid = u_cid || undefined;
        this.p_id = p_id || undefined;
        this.p = p || undefined;
        this.p_img = p_img || undefined;
        this.p_detail = p_detail || undefined;
        this.p_plan_array = p_plan_array || undefined;
        this.p_format_array = p_format_array || undefined;
        this.m = m || undefined
        this.p_plan = p_plan || undefined;
        this.p_price = p_price || undefined;
        this.p_combined = p_combined || undefined;
        this.p_format = p_format || undefined;
        this.p_shipway = p_shipway || undefined;
        this.p_shipway_1_1 = p_shipway_1_1 || undefined;
        this.p_shipway_1_2 = p_shipway_1_2 || undefined;
        this.p_shipway_1_3 = p_shipway_1_3 || undefined;
        this.p_shipway_1_4 = p_shipway_1_4 || undefined;
        this.p_shipway_1_zip = p_shipway_1_zip || undefined;
        this.p_shipway_2_1 = p_shipway_2_1 || undefined;
        this.p_shipway_2_2 = p_shipway_2_2 || undefined;
        this.p_shipway_2_3 = p_shipway_2_3 || undefined;
        this.p_shipway_2_4 = p_shipway_2_4 || undefined;
        this.c_name = c_name || undefined;
        this.c_phone = c_phone || undefined;
        this.c_email = c_email || undefined;
        this.s_o = s_o || undefined;
        this.b_name = b_name || undefined;
        this.b_phone = b_phone || undefined;
        this.b_email = b_email || undefined;
        this.p_paymentway = p_paymentway || undefined;
        this.o = o || undefined
        this.o_1 = o_1 || undefined
        this.sun = sun || undefined
    }
}

exports.UserInfo = UserInfo;
