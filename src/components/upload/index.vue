<template>
  <n-upload :action="baseURL + '/file/upload'" :default-file-list="fileList" @finish="handleFinish"
    @before-upload="beforeUpload" list-type="image-card" :max="props.max">
    <n-button>上传文件</n-button>
  </n-upload>
</template>

<script lang="ts" setup>
import { defineComponent, ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
const baseURL = import.meta.env.VITE_BASEURL as string;

const props = defineProps<{
  max: number,
  fileList: string[],
  type: string
}>();



const emits = defineEmits(['changeImage'])

const message = useMessage()
const handleFinish = ({
  file,
  event
}: {
  file: UploadFileInfo
  event?: ProgressEvent
}) => {
  const data = (event?.target as XMLHttpRequest).response
  const { msg } = JSON.parse(data);
  emits('changeImage', {
    msg
  })
}

const fileList = ref<UploadFileInfo[]>([])



watch(
  () => props.fileList,
  (newValue, oldValue) => {
    const files = [];
    props.fileList.forEach(file => {
      const item = {
        url: `${baseURL}/file/image/${file}`, id: 'c',
        name: '我是自带url的图片.png',
        status: 'finished',
      }
      files.push(item);
    });
    fileList.value = files;

  },
  { immediate: true }
)

const beforeUpload = (data: {
  file: UploadFileInfo
  fileList: UploadFileInfo[]
}) => {
  if (!props.type.includes(data?.file?.file?.type)) {
    message.error('上传格式错误')
    return false
  }
  return true
}

</script>
