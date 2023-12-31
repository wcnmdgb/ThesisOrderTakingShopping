export const scouponOptions = new Map([
  [1, { label: '已下架', type: 'warning' }],
  [0, { label: '正常', type: 'success' }],
  [2, { label: '已抢完', type: 'error' }],
  [3, { label: '赠送券', type: 'info' }],
])

export const options = [
  { label: '正常', value: 0 },
  { label: '已下架', value: 1 },
  { label: '已抢完', value: 2 },
  { label: '赠送券', value: 3 },
]
