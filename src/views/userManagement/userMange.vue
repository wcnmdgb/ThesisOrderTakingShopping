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
    <n-modal v-model:show="model.isShow" preset="dialog">

      <template #header>
        <div>{{ model.title }}</div>
      </template>
      <div v-if="model.content === 0">
        <n-form ref="formRef" :label-width="80" :model="modelFrom" label-placement="left" :rules="rules">

          <n-form-item label="状态" path="ban">
            <n-select v-model:value="modelFrom.ban" placeholder="请选择状态" :options="options" clearable>
            </n-select>
          </n-form-item>
        </n-form>
      </div>
      <div v-else>
        <n-form ref="formRef" :label-width="80" :model="modelFrom" label-placement="left" :rules="rules">
          <n-form-item label="优惠" path="coppon">
            <n-select v-model:value="modelFrom.coppon" placeholder="选择优惠券" :options="givCouponList" clearable>
            </n-select>
          </n-form-item>
        </n-form>
      </div>
      <template #action>
        <div class="model_button">
          <NButton @click="model.onNegativeClick">取消</NButton>
          <NButton @click="model.positiveclick" type="primary">{{ model.positiveText }}</NButton>
        </div>
      </template>


    </n-modal>

  </div>
</template>
<script lang="ts" setup>


import { usePagination, useRowKey, useTable, useTableColumn } from '@/hooks/table'
import { DataFormType, FormItem } from '@/types/components'
import { DataTableColumn, DataTableRowKey, FormInst, NInput, NSelect, useDialog, useMessage } from 'naive-ui'
import { NButton, NTag } from 'naive-ui/lib/components'
import { h, onMounted, reactive, ref } from 'vue'

import { formatdate } from "@/utils/dayjs"
import { options } from '@/api/user/options'
import { finGivCouppon, findUser, subGiveCoupon, updateUser } from '@/api/user'
import { Xlxw_blance, giveCouppon } from '@/api/user/type'

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
        options: options,
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
        h(NButton, { size: 'small', type: 'primary', color: "#06a5eb", disabled: !(checkedRowKeysRef?.value?.length >= 1), onClick: giftVoucher }, '赠送券'),
        h(NButton, { size: 'small', type: 'primary', color: "#06a5eb", disabled: checkedRowKeysRef?.value?.length !== 1, onClick: selectAlter }, '修改'),
      ])
    },
  },
]
const formRef = ref<FormInst | null>(null)
const searchForm = ref<DataFormType | null>(null)

const table = useTable()
const message = useMessage()
const tableLoading = ref(false)
const rowKey = useRowKey('id')
const dataList = ref();
const checkedRowKeysRef = ref();
//选择框
const givCouponList = ref<any[]>([]);

const from = reactive({ name: "", index: 1, status: null })
/**弹出框内容 */
const model = reactive({ isShow: false, title: "添加分类", positiveText: "确认添加", positiveclick: () => { }, onNegativeClick: () => { model.isShow = false }, content: 0 });
//添加和修改的表单内容
const modelFrom = reactive({ id: "", ban: null, coppon: null })
const pagination = usePagination(doRefresh)
pagination.pageSize = 10
pagination.page = from.index;
const dialog = useDialog()
//添加和修改的表单规则
const rules = ref({

  ban: {
    type: 'number',
    required: true,
    message: '请选择状态',
    trigger: ['blur', 'change'],
  },
  coppon: {
    type: 'number',
    required: true,
    message: '请选择优惠券',
    trigger: ['blur', 'change'],
  }

});
//表单列
const tableColumns = useTableColumn(
  [
    table.selectionColumn,
    table.indexColumn,
    {
      title: '名称',
      key: 'user_name',
      ellipsis: {
        tooltip: true,
      },
    },
    {
      title: '余额',
      key: 'status',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData: any) => {
        return h('div', funMoney(rowData?.xlxw_balances))
      },
    },
    {
      title: 'vip',
      key: 'vip',
      ellipsis: {
        tooltip: true,
      },

    },
    {
      title: '状态',
      key: 'ban',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData) => {
        return h(NTag, { type: `${rowData.ban === 0 ? 'success' : 'error'}`, size: 'small' }, rowData.ban === 0 ? '正常' : '封禁')
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
      title: '编辑',
      key: 'edit',
      width: 100,
      render: (rowData) => {
        return h(NButton, { type: "primary", size: 'small', onClick: () => showEdit(rowData) }, '编辑')
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
  const { code, data: { rows, count } } = await findUser(from.name, from.index, from.status)
  tableLoading.value = true;
  if (code == '000') {
    dataList.value = rows;
    pagination.setTotalSize(count);
  } else {
    message.error('获取用户信息失败');
  }
  tableLoading.value = false;
}
/**
 *
 * @param rowData 修改用户-填充model内容
 */
const showEdit = (rowData: any) => {
  model.isShow = true;
  model.title = "修改用户"
  model.positiveText = '确认修改'
  model.content = 0
  model.positiveclick = alterTrade;
  for (let key in modelFrom) {
    modelFrom[key] = rowData[key];
  }
}
/**
 * 赠送券
 */
const giftVoucher = () => {
  model.isShow = true;
  model.title = "赠送券"
  model.positiveText = '确认赠送'
  model.content = 1
  model.positiveclick = gievCoppon;
}


/**
 * 用户添加券
 */
const gievCoppon = async () => {
  const ids: [] = checkedRowKeysRef.value;
  const items: string[] = [];
  //获取删除的标题
  dataList.value?.forEach(e => {
    if (ids.includes(e.id)) {
      items.push(e.title);
    }
  })
  dialog.warning({
    title: '警告',
    content: `你确定为用户添加优惠券吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { msg, code } = await subGiveCoupon(ids, modelFrom.coppon);
      if (code == '000') {
        doRefresh();
        message.success(msg);
      } else {
        message.error(msg);
      }
      model.isShow = false;
    },

    onNegativeClick: () => {
      message.success("取消成功");
    }
  })

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
 * 修改用户状态
 */
const alterTrade = () => {

  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const { msg, code } = await updateUser(modelFrom.id, modelFrom.ban);
      if (code == '000') {
        message.success(msg);
        doRefresh();
      } else {
        message.error(msg);
      }
      model.isShow = false;
    } else {
      message.error('验证失败')
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

/**获取选中列编辑 */
const selectAlter = () => {
  const rowData = dataList.value?.find(e => {
    return e.id == checkedRowKeysRef.value[0]
  })
  showEdit(rowData);
}

/**
 * 计算用户的余额
 * @param moneys
 */
const funMoney = (moneys: Xlxw_blance[] | undefined) => {
  let money = 0;
  if (moneys?.length === 0) {
    return money.toFixed(2);
  } else {

    moneys?.filter(item => {
      if (item.status == 0) {
        money += item.money;
      } else {
        money -= item.money;
      }

    })
    return money.toFixed(2);
  }


}

/**
 * 打开赠送券
 */


/**
 * 获取赠送列表
 */
const giveUserCoupon = async () => {
  const { data } = await finGivCouppon(3);

  data.forEach(e => {
    let item = { label: "", value: null };
    item.label = `满 ${e.condition / 100}立减${e.money / 100}`
    item.value = e.id;
    givCouponList.value.push(item);
  })
}



onMounted(async () => {
  doRefresh()
  giveUserCoupon()
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
