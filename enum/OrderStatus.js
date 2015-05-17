/**
 * Created by Administrator on 2015/5/17.
 */

exports.CREATED = 0;        // 订单创建
exports.PAYMENT = 1;        // 已经付款
exports.EXPRESS = 2;        // 已经发货
exports.FINISH = 3;         // 订单完成
exports.CANCEL = 4;         // 订单取消(未付款)
exports.APPLY_REFUSE = 5;   // 申请退款
exports.REFUSING = 6;       // 退款中
exports.REFUSE = 7;         // 订单退款并取消
