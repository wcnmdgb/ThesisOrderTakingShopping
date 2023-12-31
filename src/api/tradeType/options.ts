/**状态下拉列 */
export const options = [
  { label: '正常', value: 0 },
  { label: '已下架', value: 1 },
]

/**订单状态下来列 */
export const orderOptions = [
  { label: '全部', value: '' },
  { label: '未支付', value: 0 },
  { label: '待取货', value: 1 },
  { label: '待清洗', value: 2 },
  { label: '配送中', value: 3 },
  { label: '已完成', value: 4 },
  { label: '已取消', value: 5 },
]

//订单状态

export const orderMap = new Map([
  [0, { label: '未支付', type: 'warning' }],
  [1, { label: '待取货', type: 'default' }],
  [2, { label: '待清洗', type: 'info' }],
  [3, { label: '配送中', type: 'primary' }],
  [4, { label: '已完成', type: 'success' }],
  [5, { label: '已取消', type: 'error' }],
])

export const paymentMap = new Map([
  [null, { label: '未支付', type: 'error' }],
  [0, { label: '微信支付', type: 'primary' }],
  [1, { label: '余额支付', type: 'warning' }],
])
