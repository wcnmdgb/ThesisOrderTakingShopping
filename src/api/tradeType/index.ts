import {
  Orderdetails,
  countResInterdace,
  tradeInterFace,
  tradeType,
  tradeTypeInterFace,
} from './type'
import { deleteT, get, post, put } from '@/api/http'

export const findTradeTypeAll = async (
  name: string,
  index: number,
  status: number | string | undefined | null
) => {
  return await get<countResInterdace<tradeType>>({
    url: `/adminhub/find/shoptype`,
    method: 'GET',
    data: {
      name,
      index,
      status,
    },
  })
}

export const addTradeType = async (label: string, status: number | string | null) => {
  return await put<undefined>({
    url: `/adminhub/put/shoptype`,
    method: 'PUT',
    data: {
      label,
      status,
    },
  })
}

export const alterTradeType = async (
  id: number | string,
  label: string,
  status: number | string | undefined | null
) => {
  return await post<undefined>({
    url: `/adminhub/alter/shoptype`,
    method: 'POST',
    data: {
      id,
      label,
      status,
    },
  })
}

export const tadeTypeDels = async (ids: string, del: number) => {
  return await deleteT<undefined>({
    url: `/adminhub/del/shoptype`,
    method: 'DELETE',
    data: {
      ids,
      del,
    },
  })
}

//获取商品分类
export const queryproduType = async (status: number) => {
  return await post<tradeTypeInterFace[]>({
    url: `/adminhub/find/shoptypeall`,
    method: 'GET',
    data: { status },
  })
}

//查询商品信息
export const queryprodu = async (
  productTypeId: string | null,
  index: number,
  tradeName: string,
  status: undefined | number | null
) => {
  return await get<countResInterdace<tradeInterFace>>({
    url: `/adminhub/find/trade`,
    method: 'GET',
    data: {
      productTypeId,
      index,
      tradeName,
      status,
    },
  })
}

//修改商品
export const alterTrade = async (
  id: number | string,
  name: string,
  desc: string,
  image: string,
  money: undefined | number,
  status: number | undefined,
  product_type_id: number | undefined
) => {
  return await post<undefined>({
    url: `/adminhub/alter/trade`,
    method: 'POST',
    data: {
      id,
      name,
      desc,
      image,
      money,
      status,
      product_type_id,
    },
  })
}

//添加商品
export const addTrade = async (
  name: string,
  desc: string,
  image: string,
  money: undefined | number,
  status: undefined | number,
  product_type_id: number | undefined
) => {
  return await put<undefined>({
    url: `/adminhub/put/trade`,
    method: 'PUT',
    data: {
      name,
      desc,
      image,
      money,
      status,
      product_type_id,
    },
  })
}

//批量删除商品
export const productListDels = async (ids: string, del: number) => {
  return await deleteT<undefined>({
    url: `/adminhub/del/trade`,
    method: 'DELETE',
    data: {
      ids,
      del,
    },
  })
}

export const finall = async (
  index: number,
  status: number | undefined | null,
  orderId: undefined | number | string | null
) => {
  return await get<countResInterdace<Orderdetails>>({
    url: `/adminhub/find/order`,
    data: {
      index,
      status,
      orderId,
    },
    method: 'GET',
  })
}

/**
 * 首页查询
 * @param status
 * @returns
 */
export const salesVolume = async () => {
  return await get<any>({
    url: `/adminhub/find/salesvolume`,
    method: 'GET',
  })
}
