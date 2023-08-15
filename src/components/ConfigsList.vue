
<template>
  <div>
    <el-container>
      <el-header>
        <!--搜索表单-->
        <el-form :inline="true" :model="configSearchForm" class="demo-form-inline">
          <el-form-item label="共享状态：">
            <el-select v-model="configSearchForm.status" placeholder="共享状态">
              <el-option label="全部" value=""></el-option>
              <el-option label="启用" value="1"></el-option>
              <el-option label="禁用" value="0"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="搜索：">
            <el-input v-model="configSearchForm.queryString" placeholder="搜索"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="getConfigsList">查询</el-button>
          </el-form-item>
        </el-form>
      </el-header>

      <el-main>
        <!--按钮-->
        <el-row>
          <el-button type="danger" plain @click="deleteByIds">批量删除</el-button>
          <el-button type="primary" plain @click="dialogVisible = true">添加新配置</el-button>
        </el-row>

        <!-- 添加配置的对话框 -->
        <el-dialog title="添加新配置" :visible.sync="dialogVisible" width="50%" @close="createConfigDialogClosed">
          <el-form :model="configCreateForm" label-width="80px" :rules="configCreateFormRules" ref="createConfigForm">
            <el-form-item label="配置名" prop="name">
              <el-input v-model="configCreateForm.name"></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="description">
              <el-input type="textarea" :rows="8" v-model="configCreateForm.description"></el-input>
            </el-form-item>
            <el-form-item label="是否共享" prop="status">
              <el-switch v-model="configCreateForm.status"
                         active-value="1"
                         inactive-value="0"
              ></el-switch>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
           <el-button type="primary" @click="createConfig">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 配置的表格 -->
        <el-table :data="configsList" stripe border style="width: 100%"
                  @select="checkSelect"
                  @selection-change="handleSelectionChange">
          <!-- 选择框 -->
          <el-table-column type="selection" width="55"></el-table-column>
          <!-- 索引列 -->
          <el-table-column type="index" width="50" label="#"></el-table-column>
          <el-table-column label="配置名" prop="name" align="center"></el-table-column>
          <el-table-column type="textarea" label="描述" prop="description" align="center"></el-table-column>
          <el-table-column label="是否共享" prop="status" align="center">
            <template #default="scope">
              <el-switch v-model="scope.row.status"
                         active-value="1"
                         inactive-value="0"
                         @change="statusChange($event, scope.row.id)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center">
            <template #default="scope">
              {{ scope.row.createTime | dateFormat }}
            </template>
          </el-table-column>
          <el-table-column label="创建用户" prop="createUser" align="center"></el-table-column>
          <el-table-column label="修改时间" align="center">
            <template #default="scope">
              {{ scope.row.modifyTime | dateFormat }}
            </template>
          </el-table-column>
          <el-table-column label="修改用户" prop="modifyUser" align="center"></el-table-column>
          <el-table-column label="操作" align="center">
            <!-- v-slot:default="scope" -->
            <!-- #default="scope" -->
            <!-- v-slot="scope" -->
            <template v-slot="{ row }">
              <el-row>
                <router-link :to="'/configs/' + row.id">
                  <el-button type="primary" size="small">详情</el-button>
                </router-link>
                <el-button type="danger" size="small" @click="deleteConfig(row.id)">删除</el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>

        <!--分页工具条-->
        <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[5, 10, 15, 20]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
      </el-main>

      <el-main class="center-row">
        <el-row class="center-row">
          <el-upload
              drag
              action="/valuation/upload/"
              multiple
              accept=".xlsx, .xls"
              :file-list="fileList"
              :before-upload="beforeUpload"
              :on-success="onUploadSuccess"
              :on-error="onUploadError"
              :on-change="handleChange"
              class="upload-container"
              :with-credentials="true"
              ref="uploadRef">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">Tips: 只能上传xlsx/xls文件</div>
          </el-upload>
        </el-row>
        <el-row>
          <el-button class="compute-button" plain type="primary" @click="compute">计算</el-button>
        </el-row>
      </el-main>
<!--      <el-footer>

      </el-footer>-->
    </el-container>
  </div>
</template>

<script>
import qs from "qs";
import { mapState, mapActions } from 'vuex';

export default {
  name: 'UserList',
  data() {
    return {
      configsList: [],
      total: 0,
      currentPage: 1,
      pageSize: 5,
      // 控制添加对话框的显示与隐藏
      dialogVisible: false,
      // 复选框选中数据集合
      multipleSelection: [],
      // 被选中的id数组
      selectedIds:[],
      fileList: [],
      fileLimit: 1,
      // 要采集的配置的信息对象
      configCreateForm: {
        name: '',
        attriConfigs: [{
          name: '',
          fieldScores: []
        }],
        rangeConfigs: [{
          targetName: '',
          func:''
        }],
        compuFormulas: [{
          targetName: '',
          func:''
        }],
        description:"",
        status: ''
      },
      configSearchForm: {
        queryString: '',
        status: ''
      },
      // 表单的验证规则对象
      configCreateFormRules: {
        name: [
          { required: true, message: '配置名是必填项', trigger: 'blur' },
          { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' },
        ]
      },
    }
  },
  created() {
    this.getConfigsList()
  },
  computed: {
    ...mapState(['paramsName'])
  },
  methods: {
    // vuex
    ...mapActions(['addParamsName','clearParamsName']),
    // 获取配置列表的数据
    async getConfigsList() {
      const {data: res} = await this.$http.get('/valuation-configs/', {
        params: {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          queryString: this.configSearchForm.queryString,
          status: this.configSearchForm.status
        }}
      )
      if (res.code !== 0) return this.$message.error('配置列表数据获取失败！' + res.msg)
      this.configsList = res.data.records
      this.total = res.data.total
      console.log(this.configsList)
    },
    // 监听对话框关闭的事件
    createConfigDialogClosed() {
      this.$refs.createConfigForm.resetFields()
    },

    createConfig() {
      this.$refs.createConfigForm.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post('/valuation-configs/', qs.stringify(this.configCreateForm),
            {
              headers:{'x-Username':'zz'}
            }
        )
        if (res.code !== 0) return this.$message.error('添加配置失败！' + res.msg)
        this.$message.success('添加成功！')
        this.dialogVisible = false
        await this.$router.push("/configs/" + res.data)
      })
    },
    async statusChange(status, id) {
      console.log("status change: " + status + ' id: ' + id)
      const {data: res} = await this.$http.put('/valuation-configs/' + id + '/change-status', null,{
        params: {status: status}
    })
      if (res.code !== 0) return this.$message.error('状态修改失败！' + res.msg)
    },

    async deleteConfig(id) {
      // 询问配置是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该配置, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err)

      // 判断是否点击了确认按钮
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除！')

      // 发起请求，删除指定 id 的数据
      const { data: res } = await this.$http.delete('/valuation-configs/', {
        params: {ids: id}
      })
      if (res.code !== 0) return this.$message.error('删除失败！' + res.msg)
      // 提示删除成功，并刷新列表数据
      this.$message.success('删除成功！')
      await this.getConfigsList()
    },

    // 批量删除
    async deleteByIds(){
      // 弹出确认提示框
      this.$confirm('此操作将删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        //配置点击确认按钮
        //1. 创建id数组 [1,2,3], 从 this.multipleSelection 获取即可
        for (let i = 0; i < this.multipleSelection.length; i++) {
          this.selectedIds[i] = this.multipleSelection[i].id;
        }
        //2. 发送AJAX请求
        const { data: res } = await this.$http.delete('/valuation-configs/', {
          params:  {ids: this.selectedIds.join(',')}
        });
        if (res.code !== 0) return this.$message.error('删除失败！')
        // 提示删除成功，并刷新列表数据
        this.$message.success('删除成功！')
        await this.getConfigsList()
      }).catch(() => {
        //配置点击取消按钮
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    //分页
    handleSizeChange(val) {
      //console.log(`每页 ${val} 条`);
      // 重新设置每页显示的条数
      this.pageSize  = val;
      this.getConfigsList();
    },
    handleCurrentChange(val) {
      //console.log(`当前页: ${val}`);
      // 重新设置当前页码
      this.currentPage  = val;
      this.getConfigsList();
    },
    // 复选框选中后执行的方法
    handleSelectionChange(val) {
      this.multipleSelection = val;
      console.log(`selectChange: ${val}`)
    },

    // 上传
    beforeUpload(file) {
      // this.$refs.uploadRef.clearFiles()
      return true
    },
    onUploadSuccess(res) {
      if (res.code !== 0) return this.$message.error('文件上传失败！' + res.msg)
      this.$message.success('文件上传成功!')
      this.clearParamsName()
      let paramsNameSet = new Set()
      res.data.forEach((data, index) => {
        data.paramsName.forEach((paramName, paramIndex) => {
          paramsNameSet.add(paramName)
        })
      })
      paramsNameSet.forEach((paramName) => {
        this.addParamsName(paramName)
      })
    },
    onUploadError(err) {
      this.$message.error('文件上传失败!' + err)
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-this.fileLimit);
    },
    // 按配置计算上传的表格
    async compute() {
      if (this.multipleSelection.length !== 1) {
        return this.$message.error("请选择一个计算规则的配置项！")
      }

      const { data: res } = await this.$http.get('/valuation/compute/' + this.multipleSelection[0].id)
      if (res.code !== 0) return this.$message.error('计算失败！' + res.msg)
      this.$message.success('计算成功！')

      // 将Base64编码字符串转换为Blob对象
      const blob = this.base64ToBlob(res.data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // 创建一个临时的下载链接
      const url = URL.createObjectURL(blob);

      // 创建一个<a>标签，并设置链接为临时的下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = 'output.xlsx'; // 设置下载文件的名称
      // 触发点击事件，实现文件下载
      link.click();

      // 释放临时的下载链接
      URL.revokeObjectURL(url);

    },
    base64ToBlob(base64Data, contentType) {
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, { type: contentType });
      return blob;
    },

    //选中复选框
    checkSelect(data){
      console.log(`选中项数据：${data}`)
    }
  },
}
</script>

<style scoped lang="less">
.el-header {
  padding-top: 20px;
  text-align: center;
}
.el-footer {

}
.center-row {
  text-align: center;
  align-items: center;
  padding-bottom: 30px;
}

/* 设置上传链接样式 */
/deep/ .upload-container .el-upload-dragger {
  width: 600px;
  height: 220px;
  padding-top: 30px;
}
.compute-button {
  width: 100px;
  height: 40px;
  font-size: 14px;
}
.el-table {
  margin-top: 15px;
}
</style>
