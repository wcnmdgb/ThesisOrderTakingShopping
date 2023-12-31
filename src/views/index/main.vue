<template>
  <div class="main-container">
    <n-grid responsive="screen" cols="1 s:2 m:4 l:4 xl:4 2xl:4" x-gap="5" y-gap="5">
      <n-grid-item v-for="(item, index) of dataList" :key="index" class="item-wrapper">
        <DataItem :data-model="item">
          <template v-if="index === 0" #extra="{ extra }">
            <div class="margin-top-lg">
              <div> 较昨日新增：{{ extra.data }} </div>
              <div class="margin-top-sm"> 较上周新增：{{ extra.data1 }} </div>
            </div>
          </template>
          <template v-else-if="index === 1" #extra="{ extra }">
            <div class="margin-top" style="position: relative">
              <div> 较昨日新增：{{ extra.data }} </div>
              <div class="margin-top-sm"> 较上周新增：{{ extra.data1 }} </div>
              <div class="stack-avatar-wrapper">
                <!-- <StackAvatar /> -->
              </div>
            </div>
          </template>
          <template v-else-if="index === 2" #extra="{ extra }">
            <n-progress type="line" :percentage="extra.data" />
          </template>
          <template v-else-if="index === 3" #extra>
            <OrderChart ref="mOrderChart" />
          </template>
        </DataItem>
      </n-grid-item>
    </n-grid>
    <n-grid class="mt-2">
      <n-grid-item :span="24">
        <FullYearSalesChart ref="fullYearSalesChart" />
      </n-grid-item>
    </n-grid>
    <n-grid responsive="screen" cols="1 s:2 m:4 l:4 xl:4 2xl:4" x-gap="5" y-gap="5" class="mt-2 mb-2">
      <n-grid-item>
        <SalesChart ref="salesChart" />
      </n-grid-item>
      <n-grid-item>
        <StudentChart ref="studentChart" class="margin-top-xs" />
      </n-grid-item>
      <n-grid-item>
        <EnrollmentChannelsChart ref="enrollmentChannelsChart" />
      </n-grid-item>
      <n-grid-item>
        <DepartmentChart ref="departmentChart" />
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script lang="ts" setup>
import DataItem from './components/DataItem.vue'
import OrderChart from './components/chart/OrderChart.vue'
import SalesChart from './components/chart/SalesChart.vue'
import StudentChart from './components/chart/StudentChart.vue'
import EnrollmentChannelsChart from './components/chart/EnrollmentChannelsChart.vue'
import FullYearSalesChart from './components/chart/FullYearSalesChart.vue'
import DepartmentChart from './components/chart/DepartmentChart.vue'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import useAppConfigStore from '@/store/modules/app-config'
import { salesVolume } from '@/api/tradeType'


const appConfigStore = useAppConfigStore()
const mOrderChart = ref<InstanceType<typeof OrderChart>>()
const salesChart = ref<InstanceType<typeof SalesChart>>()
const enrollmentChannelsChart = ref<InstanceType<typeof EnrollmentChannelsChart>>()
const studentChart = ref<InstanceType<typeof StudentChart>>()
const fullYearSalesChart = ref<InstanceType<typeof FullYearSalesChart>>()
const departmentChart = ref<InstanceType<typeof DepartmentChart>>()

const onResize = () => {
  setTimeout(() => {
    mOrderChart.value?.updateChart()
    salesChart.value?.updateChart()
    enrollmentChannelsChart.value?.updateChart()
    studentChart.value?.updateChart()
    fullYearSalesChart.value?.updateChart()
    departmentChart.value?.updateChart()
  }, 500)
}

const dataList = ref([
  {
    title: '今日完成订单',
    data: '',
    bottomTitle: '总完成量',
    totalSum: 0,
    iconClass: 'data-chart',
    extra: {
      data: 0,
      data1: 0,
    },
  },
  {
    title: '今日下单量',
    data: 0,
    bottomTitle: '总下单量',
    totalSum: 0,
    iconClass: 'data-people',
    extra: {
      data: 0,
      data1: 0,
    },
  },
  {
    title: '当月销售额',
    data: '',
    bottomTitle: '累计销售额',
    totalSum: '',
    iconClass: 'data-money',
    extra: {
      data: 80,
    },
  },
  {
    title: '当月订单量',
    data: '',
    bottomTitle: '累计订单量',
    totalSum: '',
    iconClass: 'data-order',
    extra: {
      data: 0,
    },
  },
])
const collapse = computed(() => {
  return appConfigStore.isCollapse
})

const orderItemList = ref();

const salesVolumeOrder = async () => {
  const { data } = await salesVolume();

  orderItemList.value = data;

  //获取今天的订单信息
  dataList.value[0].data = coponent(0, 'theDay').toString();
  dataList.value[0].extra.data = parseInt(dataList.value[0].data) - coponent(4, 'yesterDay');
  dataList.value[0].extra.data1 = parseInt(dataList.value[0].data) - coponent(4, 'sevenDays')
  dataList.value[0].totalSum = coponent(4, 'theSum').toString();

  //获取下单
  dataList.value[1].data = coponent(0, 'theDay').toString();
  dataList.value[1].extra.data = parseInt(dataList.value[0].data) - coponent(0, 'yesterDay');
  dataList.value[1].extra.data1 = parseInt(dataList.value[0].data) - coponent(0, 'sevenDays')
  dataList.value[1].totalSum = coponent(0, 'theSum').toString();

  //获取本月的营销额
  dataList.value[2].data = coponentMony(4, 'theMoth').toString();
  dataList.value[2].totalSum = coponentMony(4, 'theSum').toString();
  dataList.value[2].extra.data = parseInt(dataList.value[2].data) / parseInt(dataList.value[2].totalSum)

  //获取订单信息
  dataList.value[3].data = coponent(4, 'theMoth').toString();
  dataList.value[3].totalSum = coponent(4, 'theSum').toString();
}

//计算函数
const coponent = (status: number, age: string) => {
  let sum = 0;
  orderItemList.value[age]?.forEach((e: { status: number; actual_payment: any }) => {
    if (e.status == status) {
      sum++;
    }
  });
  return sum;
}
//计算收益
const coponentMony = (status: number, age: string) => {
  let sum = 0;
  orderItemList.value[age]?.forEach((e: { status: number; actual_payment: any }) => {
    if (e.status == status) {
      sum += e.actual_payment;
    }
  });
  return sum.toFixed(2);
}
watch(collapse, () => {
  onResize()

})
onMounted(() => {
  salesVolumeOrder();
})

</script>

<style lang="scss" scoped>
@media screen and (max-width: 992px) {
  .item-wrapper {
    margin-bottom: 5px;
  }

  .map-margin-tb {
    margin: 5px 0;
  }
}

.light {
  .chart-item {
    background-color: #fff;
  }
}

.stack-avatar-wrapper {
  position: absolute;
  right: -2%;
  top: 10%;
}
</style>
