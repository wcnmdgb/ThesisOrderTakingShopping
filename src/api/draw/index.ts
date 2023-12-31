import { number } from 'echarts'
import { deleteT, get, post, put } from '../http'
import { countResInterdace } from '../tradeType/type'
import { draw } from './type'

//查询展示图片
export const findDraw = async (index: number, status: undefined | number | null, title: string) => {
  return await get<countResInterdace<draw>>({
    url: `/adminhub/find/draw`,
    method: 'GET',
    data: {
      index,
      status,
      title,
    },
  })
}

export const addDraw = async (title: string, status: undefined | number | null, image: string) => {
  return await put<countResInterdace<undefined>>({
    url: '/adminhub/put/draw',
    method: 'PUT',
    data: {
      title,
      status,
      image,
    },
  })
}

export const alterDraw = async (
  title: string,
  status: undefined | number | null,
  image: string,
  id: number | undefined | string
) => {
  return await post<countResInterdace<undefined>>({
    url: '/adminhub/alter/draw',
    method: 'POST',
    data: {
      title,
      status,
      image,
      id,
    },
  })
}

export const delDraw = async (ids: string) => {
  return await deleteT<countResInterdace<any>>({
    url: '/adminhub/del/draw',
    method: 'DELETE',
    data: {
      ids: ids,
    },
  })
}
