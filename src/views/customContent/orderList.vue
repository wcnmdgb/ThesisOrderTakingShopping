<template>
  <div class="main-container">
    <TableBody ref="tableBody">

      <template #header>
        <DataForm ref="searchForm" :form-config="{
          labelWidth: 70,
        }" :options="conditionItems" preset="grid-item" />
      </template>
      <template #default>
        <n-data-table size="small" :loading="tableLoading" :data="dataList" :columns="tableColumns" default-expand-all />
      </template>
      <template #footer>
        <TableFooter :pagination="pagination" :page="from.index" />
      </template>
    </TableBody>

    <n-modal v-model:show="showOrderModel.show" class="custom-card" preset="card" :style="bodyStyle"
      :title="showOrderModel.title" size="huge" :bordered="false" :segmented="segmented">
      <n-data-table size="small" :data="orderDataList" :columns="tableOrderColumns" default-expand-all />
    </n-modal>
  </div>
</template>
<script lang="ts" setup>


import { usePagination, useTable, useTableColumn } from '@/hooks/table'
import { DataFormType, FormItem } from '@/types/components'
import { DataTableColumn, FormInst, NInput, NSelect, NTag, useDialog, useMessage } from 'naive-ui'
import { NButton, NImage } from 'naive-ui/lib/components'
import { h, onMounted, reactive, ref } from 'vue'
import { finall } from '@/api/tradeType/index';
import { tradeType } from '@/api/tradeType/type'
import { formatdate } from "@/utils/dayjs"
import { orderMap, orderOptions, paymentMap } from '@/api/tradeType/options'

const bodyStyle = { width: '800px' };
const segmented = { content: 'soft', footer: 'soft' } as const;
const conditionItems: Array<FormItem> = [
  {
    key: 'orderId',
    label: '订单号',
    value: ref(null),
    render: () => {
      return h(NInput, {
        clearable: true,
        placeholder: '请输入订单号名称',
        value: from.orderId,
        onUpdateValue: (val) => {
          from.orderId = val
        },
      })
    },
  },
  {
    key: 'orderStatus',
    label: '订单状态',
    value: ref(null),
    render: () => {
      return h(NSelect, {
        options: orderOptions,
        placeholder: '请选择订单状态状态',
        clearable: true,
        value: from.status,
        onUpdateValue: (val) => {
          from.status = val
        },
      })
    },
  },
  {
    key: 'button_group',
    label: '',
    value: ref(null),
    render: () => {
      return h('div', { class: 'from-button' }, [
        h(NButton, { size: 'small', type: 'primary', onClick: doRefresh }, '搜索'),
        h(NButton, { size: 'small', type: 'primary', onClick: clearFrom }, '清除'),
      ])
    },
  },
  {
    key: 'button_group',
    label: '',
    value: ref(null),
    render: () => {
      return h('div', { class: 'from-button' }, [
        h(NButton, { size: 'small', type: 'primary', color: "#06a5eb", onClick: exportOrder }, '导出'),
      ])
    },
  },
]

const searchForm = ref<DataFormType | null>(null)

const table = useTable()
const message = useMessage()
const tableLoading = ref(false)
const baseURL = import.meta.env.VITE_BASEURL as string;
const dataList = ref();


const from = reactive({ orderId: '', index: 1, status: null })

const pagination = usePagination(doRefresh)
pagination.pageSize = 10
pagination.page = from.index;
const dialog = useDialog()

const showOrderModel = ref({ show: false, title: "订单详情" });

//商品详情
const orderDataList = ref();

type orderType = 'primary' | 'warning' | 'info' | 'primary' | 'success' | 'error'

//表单列订单1
const tableColumns = useTableColumn(
  [
    table.indexColumn,
    {
      title: '订单号',
      key: 'order_id',
      ellipsis: {
        tooltip: true,
      },
    },

    {
      title: '订单状态',
      key: 'status',
      render: (rowData) => {
        return h(NTag, { type: `${(orderMap.get(rowData.status as number)?.type) as orderType}`, size: "small" }, orderMap.get(rowData.status as number)?.label)
      },

    },
    {
      title: '收货人',
      key: 'create_time',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData: any) => {
        return h('div', rowData?.xlxw_address?.consignee_name);
      },
    },
    {
      title: '手机号',
      key: 'create_time',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData: any) => {
        return h('div', rowData?.xlxw_address?.phone);
      },
    },
    {
      title: '收货地址',
      key: 'create_time',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData: any) => {
        return h('div', `${rowData?.xlxw_address?.dormitory_number}栋${rowData?.xlxw_address?.lou_number}楼`);
      },
    },
    {
      title: '支付方式',
      key: 'payment',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData: any) => {
        return h(NTag, { type: `${(paymentMap.get(rowData.payment as number)?.type) as orderType}`, size: "small" }, paymentMap.get(rowData.payment as number)?.label)
      },

    },
    {
      title: '总价',
      key: 'actual_payment',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData: any) => {
        return h('div', rowData.actual_payment / 100);
      },

    },
    {
      title: '创建时间',
      key: 'create_time',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData) => {
        return h('div', formatdate(rowData.create_time));
      },
    },
    {
      title: '详情',
      key: 'edit',
      width: 100,
      render: (rowData) => {
        return h(NButton, { type: "primary", secondary: 'true', size: 'small', onClick: () => showOrder(rowData) }, '详情')
      },
    },
  ],
  {
    align: 'center',
  } as DataTableColumn
)
//表单列订单详情
const tableOrderColumns = useTableColumn([
  table.indexColumn,
  {
    title: '商品名称',
    key: 'order_name',
    ellipsis: {
      tooltip: true,
    },
    render: (rowData: any) => {
      return h('div', rowData?.xlxw_trade?.name)
    },
  },
  {
    title: '商品图片',
    key: 'img',
    ellipsis: {
      tooltip: true,
    },
    render: (rowData: any) => {
      return h(NImage, { src: `${baseURL}/file/image/${rowData?.xlxw_trade?.image}`, fallbackSrc: "https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg", width: 50 })
    },
  },
  {
    title: '商品价格',
    key: 'money',
    ellipsis: {
      tooltip: true,
    },
    render: (rowData: any) => {
      return h('div', rowData?.xlxw_trade?.money / 100)
    },
  },
  {
    title: '商品数量',
    key: 'number',
    ellipsis: {
      tooltip: true,
    },
  }
],
  {
    align: 'center',
  } as DataTableColumn)

/**
 * 查询table信息
 */
async function doRefresh() {
  from.index = pagination.page;
  const { data: { rows, count }, code } = await finall(from.index, from.status, from.orderId);
  tableLoading.value = true;
  if (code == '000') {
    dataList.value = rows;
    pagination.setTotalSize(count);
  } else {
    message.error('获取订单信息失败');
  }
  tableLoading.value = false;
}


/**
 * 清空查询
 */
const clearFrom = () => {
  pagination.page = 1;
  from.orderId = '';
  from.status = null;
  doRefresh();
}
/**
 * 展示订单列表
 */
const showOrder = (rowData: any) => {
  showOrderModel.value.show = true;
  orderDataList.value = rowData.xlxw_order_trades;
}

//将订单信息导出
const exportOrder = async () => {
  // loading.value = true;
  // const { code } = await queryExportOrder();
  // loading.value = false;
  // if (code == 200) {
  //   window.open('/file/image/订单表.xlsx', '_self');
  // }
};

onMounted(async () => {
  doRefresh()
})
</script>

<style lang="scss" scoped>
.avatar-container {
  position: relative;
  width: 30px;
  height: 30px;
  margin: 0 auto;
  vertical-align: middle;

  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .avatar-vip {
    border: 2px solid #cece1e;

  }

  .vip {
    position: absolute;
    top: 0;
    right: -9px;
    width: 15px;
    transform: rotate(60deg);
  }
}

.gender-container {
  .gender-icon {
    width: 20px;

  }
}

:deep(.from-button) {
  display: flex;
  gap: 10px;
}

.model_button {
  display: flex;
  gap: 10px;
}
</style>
