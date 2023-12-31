<template>
  <div class="main-container">
    <TableBody ref="tableBody">
      <template #header>
        <DataForm ref="searchForm" :form-config="{
          labelWidth: 90,
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
      <div>

        <n-form ref="formRef" :label-width="100" :model="modelFrom" label-placement="left" :rules="rules">
          <n-form-item label="优惠券标题" path="title">
            <n-input :disabled="model.disabled" v-model:value="modelFrom.title" placeholder="输入优惠券标题" clearable />
          </n-form-item>
          <n-form-item label="优惠券金额" path="money">
            <n-input :disabled="editDis" v-model:value="modelFrom.money" placeholder="输入优惠券金额" clearable />
          </n-form-item>
          <n-form-item label="优惠券条件" path="condition">
            <n-input :disabled="editDis" v-model:value="modelFrom.condition" placeholder="输入优惠券使用条件" clearable />
          </n-form-item>
          <n-form-item label="优惠券数量" path="number">
            <n-input :disabled="editDis" v-model:value="modelFrom.number" placeholder="输入优惠券数量" clearable />
          </n-form-item>
          <n-form-item label="状态" path="status">
            <n-select :disabled="model.disabled" v-model:value="modelFrom.status" placeholder="请选择状态" :options="options"
              clearable>
            </n-select>
          </n-form-item>
        </n-form>
      </div>
      <template #action>
        <div class="model_button">
          <NButton @click="model.onNegativeClick" :disabled="model.disabled">取消</NButton>
          <NButton @click="model.positiveclick" :disabled="model.disabled" type="primary">{{ model.positiveText }}
          </NButton>
        </div>
      </template>


    </n-modal>

  </div>
</template>
<script lang="ts" setup>


import { usePagination, useRowKey, useTable, useTableColumn } from '@/hooks/table'
import { DataFormType, FormItem } from '@/types/components'
import { DataTableColumn, DataTableRowKey, FormInst, FormItemRule, NInput, NSelect, useDialog, useMessage } from 'naive-ui'
import { NButton, NTag } from 'naive-ui/lib/components'
import { h, onMounted, reactive, ref } from 'vue'
import { formatdate } from "@/utils/dayjs"
import { options, scouponOptions } from '@/api/setting/options'
import { createCoupon, delCoupon, findAllCoupon, updateCoupon } from '@/api/setting/index'

const conditionItems: Array<FormItem> = [
  {
    key: 'name',
    label: '优惠券标题',
    value: ref(null),
    render: () => {
      return h(NInput, {
        clearable: true,
        placeholder: '请输入商品名称',
        value: from.title,
        onUpdateValue: (val) => {
          from.title = val
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
        h(NButton, { size: 'small', type: 'primary', color: "#06a5eb", onClick: showCreate }, '添加'),
        h(NButton, { size: 'small', type: 'primary', color: "#06a5eb", disabled: !(checkedRowKeysRef?.value?.length >= 1), onClick: delTrade }, '删除'),
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
type couponType = 'primary' | 'warning' | 'info' | 'primary' | 'success' | 'error'

const from = reactive({ title: "", index: 1, status: null })
/**弹出框内容 */
const model = reactive({ disabled: false, isShow: false, title: "添加优惠券", positiveText: "确认添加", positiveclick: () => { }, onNegativeClick: () => { model.isShow = false } });
//添加和修改的表单内容
const modelFrom = reactive({
  money: undefined,
  condition: undefined,
  number: undefined,
  status: undefined,
  title: "",
  id: 0
})

const editDis = ref(false);
const pagination = usePagination(doRefresh)
pagination.pageSize = 10
pagination.page = from.index;
const dialog = useDialog()
//添加和修改的表单规则
const rules = ref({
  money: {

    required: true,
    message: '请填写优惠券金额',
    trigger: ['input', 'blur']
  },
  number: {

    required: true,
    message: '请填写优惠券数量',
    trigger: ['input', 'blur']
  },
  condition:
  {
    required: true,
    validator: validatePasswordStartWith,

    trigger: ['input', 'blur']
  },
  title: {
    required: true,
    message: '请填写优惠券标题',
    trigger: ['input', 'blur']
  },
  status: {
    type: 'number',
    required: true,
    message: '请选择优惠券状态',
    trigger: ['blur', 'change'],
  }

});

//优惠条件渲染
function validatePasswordStartWith(
  rule: FormItemRule,
  value: string
) {
  if (!value) {
    return new Error('请填写优惠条件');
  } else if (parseInt(value) < parseInt(modelFrom?.money)) {
    return new Error('优惠金额不得大于优惠条件');
  }
  return true

}
//表单列
const tableColumns = useTableColumn(
  [
    table.selectionColumn,
    table.indexColumn,
    {
      title: '优惠券标题',
      key: 'title',
      ellipsis: {
        tooltip: true,
      },
    },
    {
      title: '创建人',
      key: 'title',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData: any) => {
        return h('div', rowData?.admin_user?.user_name)
      }
    },
    {
      title: '金额',
      key: 'title',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData: any) => {
        return h('div', (rowData?.money / 100).toFixed(2))
      }
    },
    {
      title: '数量',
      key: 'title',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData: any) => {
        return h('div', rowData?.number)
      }
    },
    {
      title: '满减条件',
      key: 'title',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData: any) => {
        return h('div', `满${(rowData?.condition / 100).toFixed(2)}元立减`)
      }
    },
    {
      title: '状态',
      key: 'status',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData) => {
        return h(NTag, { type: scouponOptions.get(rowData.status as number)?.type as couponType, size: 'small' }, scouponOptions.get(rowData.status as number)?.label)
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
  const { data: { rows, count }, code } = await findAllCoupon(from.title, from.status, from.index)
  tableLoading.value = true;
  if (code == '000') {
    dataList.value = rows;
    pagination.setTotalSize(count);
  } else {
    message.error('获取商品优惠券失败');
  }
  tableLoading.value = false;
}
/**
 *
 * @param rowData 修改优惠券-填充model内容
 */
const showEdit = (rowData: any) => {
  model.isShow = true;
  model.title = "修改优惠券";
  editDis.value = true;
  model.positiveText = '确认修改'
  model.disabled = rowData.status === 0 ? false : true;
  model.positiveclick = alterTrade;
  for (let key in modelFrom) {
    modelFrom[key] = rowData[key];
  }
  modelFrom['money'] = (rowData['money'] / 100).toFixed(2).toString();
  modelFrom['condition'] = (rowData['condition'] / 100).toFixed(2).toString();
  modelFrom['number'] = (rowData['number'].toString())
}
/**
 * 点击添加优惠券
 */
const showCreate = () => {
  model.disabled = false;
  model.isShow = true;
  model.title = "添加优惠券"
  editDis.value = false;
  model.positiveText = '确认添加'
  model.positiveclick = createTrade;
  for (let key in modelFrom) {
    modelFrom[key] = null;
  }
}
/**
 * 清空查询
 */
const clearFrom = () => {
  pagination.page = 1;
  from.title = ""
  from.status = null;
  doRefresh();
}

/**
 * 添加优惠券
 */
const createTrade = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const { msg, code } = await createCoupon(modelFrom.title, modelFrom.status, modelFrom.number, modelFrom.money, modelFrom.condition)
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
 * 修改优惠券
 */
const alterTrade = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const { msg, code } = await updateCoupon(modelFrom.id, modelFrom.title, modelFrom.status, modelFrom.number, modelFrom.money, modelFrom.condition)
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
 * 删除优惠券
 */
const delTrade = async () => {
  const ids: [] = checkedRowKeysRef.value;
  const items: string[] = [];
  //获取删除的优惠券名称
  dataList.value?.forEach(e => {
    if (ids.includes(e.id)) {
      items.push(e.title);
    }
  })
  dialog.warning({
    title: '警告',
    content: `你确定删除${items}优惠券吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { msg, code } = await delCoupon(JSON.stringify(ids));
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

/**获取选中列编辑 */
const selectAlter = () => {
  const rowData = dataList.value?.find(e => {
    return e.id == checkedRowKeysRef.value[0]
  })
  showEdit(rowData);
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
