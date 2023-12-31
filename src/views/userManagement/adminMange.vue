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
      <div>
        <n-form ref="formRef" :label-width="80" :model="modelFrom" label-placement="left" :rules="rules">
          <n-form-item label="用户名" path="userName">
            <n-input v-model:value="modelFrom.userName" placeholder="输入姓名" clearable />
          </n-form-item>
          <n-form-item label="密码" path="password">
            <n-input v-model:value="modelFrom.password" type="password" placeholder="请填写密码" clearable />
          </n-form-item>
          <n-form-item label="头像" path="image">
            <!-- <n-input v-model:value="modelFrom.image" placeholder="选择头像" clearable /> -->
            <Upload @changeImage="changeimag" :max="1" :fileList="[modelFrom.image]" :type="[`image/png`, `image/jpg`]">
            </Upload>
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


import { usePagination, useTable, useTableColumn } from '@/hooks/table'
import { DataFormType, FormItem } from '@/types/components'
import { DataTableColumn, FormInst, NInput, useDialog, useMessage } from 'naive-ui'
import { NButton, NImage } from 'naive-ui/lib/components'
import { h, onMounted, reactive, ref } from 'vue'
import { formatdate } from "@/utils/dayjs"
import { findAdminUser, register } from '@/api/user/index';
import { MD5_Encrypt } from '@/utils/crypt'
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
      ])
    },
  },
]
const formRef = ref<FormInst | null>(null)
const searchForm = ref<DataFormType | null>(null)

const table = useTable()
const message = useMessage()
const tableLoading = ref(false)

const dataList = ref();

//选择框
const baseURL = import.meta.env.VITE_BASEURL as string;

const from = reactive({ name: "", index: 1, status: null })
/**弹出框内容 */
const model = reactive({ isShow: false, title: "添加分类", positiveText: "确认添加", positiveclick: () => { }, onNegativeClick: () => { model.isShow = false } });
//添加和修改的表单内容
const modelFrom = reactive({ userName: "", password: "", image: "" })
const pagination = usePagination(doRefresh)
pagination.pageSize = 10
pagination.page = from.index;
const dialog = useDialog()
//添加和修改的表单规则
const rules = ref({
  userName: {
    required: true,
    message: '请输入用户名',
    trigger: ['input', 'blur']
  },
  password: {

    required: true,
    message: '请输入密码',
    trigger: ['blur', 'change'],
  },
  image: {
    required: true,
    message: '请选择头像',
    trigger: ['blur', 'change'],
  }

});
//表单列
const tableColumns = useTableColumn(
  [

    table.indexColumn,
    {
      title: '昵称',
      key: 'user_name',
      ellipsis: {
        tooltip: true,
      },
    },
    {
      title: '头像',
      key: 'images',
      ellipsis: {
        tooltip: true,
      },
      render: (rowData) => {
        return h(NImage, { src: `${baseURL}/file/image/${rowData?.images}`, fallbackSrc: "https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg", width: 50 })
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
        return h(NButton, { type: "primary", size: 'small', onClick: () => { console.log("详情") } }, '详情')
      }
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
  const { code, data: { rows, count } } = await findAdminUser(from.name, from.index)
  tableLoading.value = true;
  if (code == '000') {
    dataList.value = rows;
    pagination.setTotalSize(count);
  } else {
    message.error('获取商品分类失败');
  }
  tableLoading.value = false;
}

/**
 * 点击添加用户信息
 */
const showCreate = () => {
  model.isShow = true;
  model.title = "添加管理员"
  model.positiveText = '确认添加'
  model.positiveclick = createAdmin;
  for (let key in modelFrom) {
    modelFrom[key] = null;
  }
}
const changeimag = (url: any) => {
  modelFrom.image = url.msg;
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
 * 添加管理员
 */
const createAdmin = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const { code, msg } = await register(
        modelFrom.userName,
        MD5_Encrypt(modelFrom.password),
        modelFrom.image
      );
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
