import dayjs from 'dayjs'

export const formatdate = (date: any) => {
  return dayjs(date).format('YYYY-MM-DD hh:mm:ss')
}
