<template>
    <div class="main-container">
        <TableBody ref="tableBody">
            <template #header>
                <DataForm ref="searchForm" :form-config="{
                    labelWidth: 70,
                }" :options="conditionItems" preset="grid-item" />
            </template>
            <template #default>
                <n-data-table size="small" :loading="tableLoading" :data="dataList" :columns="tableColumns"
                    :row-key="rowKey" @update:checked-row-keys="handleCheck" />
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
                    <n-form-item label="展示标题" path="title">
                        <n-input v-model:value="modelFrom.title" placeholder="展示标题" clearable />
                    </n-form-item>
                    <n-form-item label="展示图" path="image">
                        <Upload @changeImage="changeimag" :max="1" :fileList="[modelFrom.image]"
                            :type="[`image/png`, `image/jpg`]">
                        </Upload>
                    </n-form-item>
                    <n-form-item label="状态" path="status">
                        <n-select v-model:value="modelFrom.status" placeholder="请选择状态" :options="options" clearable>
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
import { DataTableColumn, DataTableRowKey, FormInst, NImage, NInput, NSelect, useDialog, useMessage } from 'naive-ui'
import { NButton, NTag } from 'naive-ui/lib/components'
import { h, onMounted, reactive, ref } from 'vue'
import { addTradeType, findTradeTypeAll, tadeTypeDels, alterTradeType } from '@/api/tradeType/index';

import { findDraw, addDraw, alterDraw, delDraw } from '@/api/draw/index'
import { formatdate } from "@/utils/dayjs"
import { options } from '@/api/tradeType/options'
import { draw } from '@/api/draw/type'

const conditionItems: Array<FormItem> = [

    {
        key: 'name',
        label: '标题',
        value: ref(null),
        render: () => {
            return h(NInput, {
                clearable: true,
                placeholder: '请输入标题',
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
const dataList = ref<draw[]>();
const checkedRowKeysRef = ref();
//选择框

const baseURL = import.meta.env.VITE_BASEURL as string;

const from = reactive({ index: 1, status: null, title: "" })
/**弹出框内容 */
const model = reactive({ isShow: false, title: "添加展示图", positiveText: "确认添加", positiveclick: () => { }, onNegativeClick: () => { model.isShow = false } });
//添加和修改的表单内容
const modelFrom = reactive({ image: "", id: "", status: null, title: "" })
const pagination = usePagination(doRefresh)
pagination.pageSize = 10
pagination.page = from.index;
const dialog = useDialog()
//添加和修改的表单规则
const rules = ref({
    title: {
        required: true,
        message: '请输入商品展示图标题',
        trigger: ['input', 'blur']
    },
    status: {
        type: 'number',
        required: true,
        message: '请选择展示图状态',
        trigger: ['blur', 'change'],
    }

});
//表单列
const tableColumns = useTableColumn(
    [
        table.selectionColumn,
        table.indexColumn,
        {
            title: '创建人',
            key: 'admin_user',
            ellipsis: {
                tooltip: true,
            },
            render: (rowData: any) => {
                return h('div', rowData?.admin_user?.user_name)
            }
        },
        {
            title: '标题',
            key: 'title',
            ellipsis: {
                tooltip: true,
            },
        },

        {
            title: "图片",
            key: "image",
            render: (rowData: any) => {
                return h(NImage, { src: `${baseURL}/file/image/${rowData?.image}`, fallbackSrc: "https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg", width: 50 })
            }

        },
        {
            title: '状态',
            key: 'status',
            ellipsis: {
                tooltip: true,
            },
            render: (rowData) => {
                return h(NTag, { type: `${rowData.status === 0 ? 'success' : 'error'}`, size: 'small' }, rowData.status === 0 ? '正常' : '已下架')
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
    const { code, data } = await findDraw(from.index, from.status, from.title);
    tableLoading.value = true;
    if (code == '000') {
        dataList.value = data.rows;
        pagination.setTotalSize(data.count);
    } else {
        message.error('获取展示失败');
    }
    tableLoading.value = false;
}

const changeimag = (url: any) => {
    modelFrom.image = url.msg;
}

/**
 *
 * @param rowData 修改展示填充model内容
 */
const showEdit = (rowData: any) => {
    model.isShow = true;
    model.title = "修改展示"
    model.positiveText = '确认修改'
    model.positiveclick = alterTrade;
    for (let key in modelFrom) {
        modelFrom[key] = rowData[key];
    }
}
/**
 * 点击添加展示
 */
const showCreate = () => {
    model.isShow = true;
    model.title = "添加展示"
    model.positiveText = '确认添加'
    model.positiveclick = createDraw;
    for (let key in modelFrom) {
        modelFrom[key] = null;
    }
}
/**
 * 清空查询
 */
const clearFrom = () => {
    pagination.page = 1;
    from.status = null;
    doRefresh();
}

/**
 * 添加展示图
 */
const createDraw = () => {
    formRef.value?.validate(async (errors) => {
        if (!errors) {
            const { msg, code } = await addDraw(modelFrom.title, modelFrom.status, modelFrom.image);
            if (code == '000') {
                message.success(msg);
                doRefresh();
            } else {
                message.error(msg);
            }
            model.isShow = false;
        } else {
            message.error('添加失败')
        }
    })

}
/**
 * 修改展示图
 */
const alterTrade = () => {
    formRef.value?.validate(async (errors) => {
        if (!errors) {
            const { msg, code } = await alterDraw(modelFrom.title, modelFrom.status, modelFrom.image, modelFrom.id)
            if (code == '000') {
                message.success(msg);
                doRefresh();
            } else {
                message.error(msg);
            }
            model.isShow = false;
        } else {
            console.log(errors)
            message.error('验证失败')
        }
    })
}
/**
 * 删除图
 */
const delTrade = async () => {
    const ids = checkedRowKeysRef.value;
    const items: string[] = [];

    dataList.value?.forEach(e => {
        if (ids.includes(e.id)) {
            items.push(e.title);
        }
    })
    dialog.warning({
        title: '警告',
        content: `你确定删除商品${items}展示图吗？`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
            const { msg, code } = await delDraw(JSON.stringify(ids))
            if (code == '000') {
                message.success(msg);
                doRefresh();
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
