export interface countResInterdace<T> {
  rows: T[]
  count: number
}

export interface tradeType {
  id: number
  label: string
  create_time: string
  status: number
}

export interface tradeTypeInterFace {
  id: number | string
  label: string
  create_time: string
  status: number | undefined
}

//商品
export interface tradeInterFace {
  id: number
  name: string
  desc: string
  image: string
  money: number
  create_time: string
  update_time: string
  status: number
  product_type_id: number
  product_type: Product_type | string
}

export interface Product_type {
  label: string
}

export interface Orderdetails {
  id: number
  order_id: string
  user_id: string
  coupon_id?: any
  actual_payment?: number
  payment?: any
  update_time: string
  create_time: string
  address_id: number
  ip: string
  status: number
  del: number
  xlxw_address: xlxw_addres
  xlxw_order_trades: Xlxw_order_trade[]
}

export interface xlxw_addres {
  id: number
  user_id: string
  checked: number
  del: number
  phone: string
  dormitory_number: string
  lou_number: string
  desc: string
  update_time: string
  create_time: string
  consignee_name: string
}

export interface Xlxw_order_trade {
  id: number
  order_id: string
  trade_id: number
  number: number
  xlxw_trade: Xlxw_trade
}

export interface Xlxw_trade {
  id: number
  name: string
  desc: string
  image: string
  money: number
  product_type_id: number
  create_time: string
  update_time: string
  del: number
  status: number
}
