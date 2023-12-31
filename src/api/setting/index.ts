import { deleteT, get, post, put } from '@/api/http'
import { countResInterdace } from '../tradeType/type'
import { rotationChartInterface } from './type'

export const finAllDrotationChart = async (
  title: string,
  index: number,
  status: undefined | number | null
) => {
  return await get<countResInterdace<rotationChartInterface>>({
    url: `/adminhub/find/rotat`,
    method: 'GET',
    data: {
      title,
      index,
      status,
    },
  })
}

//添加轮播图
export const addRotation = async (
  title: string,
  status: number | undefined | string | null,
  image: string
) => {
  return await put<undefined>({
    url: `/adminhub/put/rotat`,
    method: 'PUT',
    data: {
      title,
      status,
      image,
    },
  })
}

//修改轮播图
export const changeRotation = async (
  id: number | undefined | number[] | null,
  title: string | undefined,
  status: number | undefined | string | null,
  image: string | undefined,
  del: number | undefined | string
) => {
  return await post<undefined>({
    url: `/adminhub/alter/rotat`,
    method: 'POST',
    data: {
      id,
      title,
      status,
      image,
      del,
    },
  })
}

//删除轮播图
export const delRotation = async (ids: string) => {
  return await deleteT<undefined>({
    url: '/adminhub/del/rotat',
    method: 'DELETE',
    data: { ids },
  })
}

export const findAllCoupon = async (
  title: string,
  status: number | undefined | null,
  index: number
) => {
  return await get<countResInterdace<couponInterface>>({
    url: `/adminhub/find/coupponall`,
    method: 'GET',
    data: {
      title,
      status,
      index,
    },
  })
}

//修改优惠券
export const updateCoupon = async (
  id: number | number[],
  title: string,
  status: number | undefined,
  number: number | undefined,
  money: number | undefined,
  condition: number | undefined
) => {
  return await post<undefined>({
    url: `/adminhub/alter/coupon`,
    method: 'POST',
    data: {
      id,
      title,
      status,
      number,
      money,
      condition,
    },
  })
}

/**
 *添加优惠券
 * @param title
 * @param status
 * @param number
 * @param money
 * @param condition
 * @returns
 */
export const createCoupon = async (
  title: string,
  status: number | undefined,
  number: number | undefined,
  money: number | undefined,
  condition: number | undefined
) => {
  return await put<undefined>({
    url: `/adminhub/put/coupon`,
    method: 'PUT',
    data: {
      title,
      status,
      number,
      money,
      condition,
    },
  })
}

//删除优惠券
export const delCoupon = async (ids: string) => {
  return await deleteT<undefined>({
    url: `/adminhub/del/coupon`,
    method: 'DELETE',
    data: { ids },
  })
}
