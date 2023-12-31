export interface adminUserInterface {
  id: number
  user_name: string
  user_id: string
  pass_word: string
  images: string
  create_time: string
  update_time: string
}

export interface interfaceUser {
  id: number
  user_name: string
  user_id: string
  ban: number
  money: number
  create_time: string
  vip: number
}

export interface Xlxw_blance {
  id: number
  money: number
  create_time: string
  update_time: string
  user_id: string
  status: number
}

export interface giveCouppon {
  id: number
  money: number
  condition: number
  user_id: number
  number: number
  status: number
  title: string
}
export interface userLoginLog {
  id: number
  admin_user_id: string
  status: number
  desc: string
  ip: string
  create_time: string
  admin_user: Admin_user | xlxw_user
}

export interface Admin_user {
  user_name: string
}
export interface xlxw_user {
  user_name: string
}
