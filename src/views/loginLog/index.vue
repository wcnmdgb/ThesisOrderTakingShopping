<template>
  <div class="main-container">
    <TableBody ref="tableBody">
      <template #header>
        <DataForm ref="searchForm" :form-config="{
          labelWidth: 70,
        }" :options="conditionItems" preset="grid-item" />
      </template>
      <template #default>
        <n-data-table size="small" :loading="tableLoading" :data="dataList" :columns="tableColumns" :row-key="rowKey"
          @update:checked-row-keys="handleCheck" />
      </template>
      <template #footer>
        <TableFooter :pagination="pagination" :page="from.index" />
      </template>
    </TableBody>

  </div>
</template>
<script lang="ts" setup>


import { usePagination, useRowKey, useTable, useTableColumn } from '@/hooks/table'
import { DataFormType, FormItem } from '@/types/components'
import { DataTableColumn, DataTableRowKey, FormInst, NInput, NSelect, useDialog, useMessage } from 'naive-ui'
import { NButton, NTag } from 'naive-ui/lib/components'
import { h, onMounted, reactive, ref } from 'vue'

import { tradeType } from '@/api/tradeType/type'
import { formatdate } from "@/utils/dayjs"
import { logOptions } from '@/api/user/options'
import { delLog, findlog } from '@/api/user'

const conditionItems: Array<FormItem> = [
  {
    key: 'name',
    label: '用户名称',
    value: ref(null),
    render: () => {
      return h(NInput, {
        clearable: true,
        placeholder: '请输入用户名称',
        value: from.name,
        onUpdateValue: (val) => {
          from.name = val
        },
      })
    },
  },
  {
    key: 'number',
    label: '状态',
    value: ref(null),
    render: () => {
      return h(NSelect, {
        options: logOptions,
        placeholder: '请选择状态',
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

        h(NButton, { size: 'small', type: 'primary', color: "#06a5eb", disabled: !(checkedRowKeysRef?.value?.length >= 1), onClick: delTrade }, '删除'),

      ])
    },
  },
]

const searchForm = ref<DataFormType | null>(null)

const table = useTable()
const message = useMessage()
const tableLoading = ref(false)
const rowKey = useRowKey('id')
const dataList = ref<tradeType[]>();
const checkedRowKeysRef = ref();
//选择框


const from = reactive({ name: "", index: 1, status: null })
/**弹出框内容 */

const pagination = usePagination(doRefresh)
pagination.pageSize = 10
pagination.page = from.index;
const dialog = useDialog()
//添加和修改的表单规则

//表单列
const tableColumns = useTableColumn(
  [
    table.selectionColumn,
    table.indexColumn,
    {
      title: '用户名',
      key: 'label',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData: any) => {
        return h('div', rowData?.admin_user?.user_name || rowData?.xlxw_user?.user_name)
      },
    },
    {
      title: '登陆IP',
      key: 'ip',
      ellipsis: {
        tooltip: true,
      },

    },

    {
      title: '描述',
      key: 'desc',
      ellipsis: {
        tooltip: true,
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


  ],
  {
    align: 'center',
  } as DataTableColumn
)
/**
 * 查询table信息
 */
async function doRefresh() {
  from.index = pagination.page;
  const { data: { rows, count }, code } = await findlog(from.name, from.status, from.index);
  tableLoading.value = true;
  if (code === '000') {
    dataList.value = rows;
    pagination.setTotalSize(count);
  } else {
    message.error('获取商品分类失败');
  }
  tableLoading.value = false;
}


/**
 * 清空查询
 */
const clearFrom = () => {
  pagination.page = 1;
  from.name = ""
  from.status = null;
  doRefresh();
}


/**
 * 删除分类
 */
const delTrade = async () => {
  const ids: [] = checkedRowKeysRef.value;

  dialog.warning({
    title: '警告',
    content: `你确定删除选中的日志吗吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { msg, code } = await delLog(JSON.stringify(ids))
      if (code == '000') {
        doRefresh();
        message.success(msg);
      } else {
        message.error(msg);
      }
    },
    onNegativeClick: () => {
      message.success("取消成功");
    }
  })

}
/**
 * 获取选中内容selectKey
 * @param rowKeys
 */
const handleCheck = (rowKeys: DataTableRowKey[]) => {
  checkedRowKeysRef.value = rowKeys
}


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
