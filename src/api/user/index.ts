import { countResInterdace } from '../tradeType/type'
import { deleteT, get, post, put } from '@/api/http'
import { adminUserInterface, giveCouppon, interfaceUser, userLoginLog } from './type'

//查询管理员用户信息
export const findAdminUser = async (userName: string, index: number) => {
  return await get<countResInterdace<adminUserInterface>>({
    url: `/adminhub/find/admin`,
    method: 'GET',
    data: {
      userName,
      index,
    },
  })
}

//发送注册请求
export const register = async (userName: string, passWord: string, images: string) => {
  return await put<undefined>({
    url: `/adminhub/put/admin`,
    method: 'PUT',
    data: {
      userName,
      passWord,
      images,
    },
  })
}

//查询用户信息
export const findUser = async (
  userName: string,
  index: number,
  ban: number | string | undefined | null
) => {
  return await get<countResInterdace<interfaceUser>>({
    url: `/adminhub/find/user`,
    method: 'GET',
    data: {
      userName,
      index,
      ban,
    },
  })
}

/**
 * 修改用户信息
 * @param id
 * @param ban
 * @returns
 */
export const updateUser = async (id: number | string, ban: string | number | undefined | null) => {
  return await post<undefined>({
    url: `/adminhub/alter/user`,
    method: 'POST',
    data: { id, ban },
  })
}

/**
 * 获取优惠券的下拉列表
 * @param status
 * @returns
 */
export const finGivCouppon = async (status: number | null) => {
  return await get<giveCouppon[]>({
    url: `/adminhub/find/givcouppon`,
    data: { status },
    method: 'GET',
  })
}

/**
 * 赠送券
 * @param userId
 * @param couponId
 * @returns
 */
export const subGiveCoupon = async (userId: string[], couponId: number | null) => {
  return await post<undefined>({
    url: `/adminhub/alter/givecoupon`,
    data: {
      userId,
      couponId,
    },
    method: 'POST',
  })
}

/**
 *
 * @param userName 获取日志
 * @param status
 * @param index
 * @returns
 */
export const findlog = async (userName: string, status: number | null, index: number) => {
  return await get<countResInterdace<userLoginLog>>({
    url: `/adminhub/find/log`,
    method: 'GET',
    data: {
      userName,
      status,
      index,
    },
  })
}
/**
 * 批量删除日志
 * @param id
 * @returns
 */
export const delLog = async (ids: string) => {
  return await deleteT<undefined>({
    url: `/adminhub/del/log`,
    data: { ids },
    method: 'DELETE',
  })
}

export const findMenu = async () => {
  return await get<any>({
    url: '/adminhub/find/routermenu',
    method: 'GET',
  })
}
