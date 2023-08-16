<template>
  <div>
    <el-card class="box-card">
      <el-form :model="configDetail" label-width="80px" :rules="configFormRules" ref="configForm">

        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>基础配置:</span>
            <el-button style="float: right; padding: 3px 0" type="text">配置说明</el-button>
          </div>
          <el-row :gutter="10">
            <el-col :span="5" :offset="4">
              <el-form-item prop="name" label="配置名:">
                <el-input type="text" v-model="configDetail.name" ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="12" :offset="4">
              <el-form-item prop="description" label="配置描述:">
                <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 8}" v-model="configDetail.description" ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="4" :offset="4">
              <el-form-item prop="status" label="是否共享:">
                <el-switch v-model="configDetail.status"
                           active-value="1"
                           inactive-value="0"
                ></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>属性分数配置:</span>
            <el-button style="float: right; padding: 3px 0" type="text">配置说明</el-button>
          </div>
          <el-tabs type="card" v-model="attriEditableTabName" editable @edit="attriTabsEdit" @tab-click="attriTabClick">
            <el-tab-pane
                :key="attriConfig.name"
                v-for="(attriConfig, acIndex) in configDetail.attriConfigs"
                :label="attriConfig.name"
                :name="attriConfig.name">
              <el-form :model="attriConfig" label-width="80px" :rules="attriConfigFormRules" ref="attriConfigForm">
                <el-row :gutter="10">
                  <el-col :span="6" :offset="8">
                    <el-form-item label="对象名:" prop="name">
                      <el-autocomplete
                          class="inline-input"
                          v-model="attriConfigNames[acIndex]"
                          :fetch-suggestions="queryParamsName"
                          :trigger-on-focus="false"
                          placeholder="对象名"
                          @select="selectParamsName($event, acIndex)"
                          @blur="attriConfigNameBlur(acIndex, attriConfigNames[acIndex])"
                      >
<!--                        <template slot-scope="{ item }">
                          <div class="name">{{ item.name }}</div>
                        </template>-->
                      </el-autocomplete>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item :gutter="10" v-for="(fieldScore, fsIndex) in attriConfig.fieldScores"
                              :key="fieldScore.key">
                  <el-form :model="fieldScore" label-width="80px" :rules="fieldScoreFormRules" ref="fieldScoreForm">
                    <el-row :gutter="10">
                      <el-col :span="6" :offset="4">
                        <el-form-item label="属性名:" prop="field">
                          <el-input type="text" v-model="fieldScore.field" ></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="6">
                        <el-form-item label="属性得分:" label-width="100px" prop="score">
                          <el-input type="text" v-model.number="fieldScore.score" ></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="1" class="text-center">
                        <el-button type="danger" icon="el-icon-delete" size="mini" plain
                                   @click.prevent="removeFieldScore(attriConfig, fieldScore)"></el-button>
                      </el-col>
                      <el-col :span="1" v-if="fsIndex === attriConfig.fieldScores.length - 1">
                        <el-button type="primary" icon="el-icon-plus" size="mini" plain
                                   @click="addFieldScore(attriConfig)"></el-button>
                      </el-col>
                    </el-row>
                  </el-form>
                </el-form-item>
                <el-row v-if="attriConfig.fieldScores.length === 0" class="flex-item">
                  <el-button type="primary" icon="el-icon-plus" size="mini" plain
                             @click="addFieldScore(attriConfig)"></el-button>
                </el-row>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>范围分数配置:</span>
            <el-button style="float: right; padding: 3px 0" type="text">配置说明</el-button>
          </div>
          <el-form-item
              v-for="(rangeConfig, index) in configDetail.rangeConfigs"
              :key="rangeConfig.key">
            <el-form :model="rangeConfig" label-width="80px" :rules="rangeConfigFormRules" ref="rangeConfigForm">
              <el-row :gutter="5">
                <el-col :span="4">
                  <el-form-item label="对象名:" prop="targetName">
                    <el-autocomplete
                        class="inline-input"
                        v-model="rangeConfig.targetName"
                        :fetch-suggestions="queryParamsName"
                        :trigger-on-focus="false"
                        placeholder="对象名"
                        @blur="rangeConfigBlur(index)">
                    </el-autocomplete>
                  </el-form-item>
                </el-col>
                <el-col :span="2">
                  <el-form-item label="配置:" prop="func"></el-form-item>
                </el-col>
                <el-form :model="rangeScoresConfigs[index]" ref="rangeScoresForm">
                  <el-col :span="2" v-for="(rangeScore, rangeScoreIndex) in rangeScoresConfigs[index].rangeScores">
                    <el-form-item :prop="`rangeScores[${rangeScoreIndex}]`" :rules="rangeScoresFormRules.rangeScores">
                      <!--string 只能这样访问，除非将string装入对象中就可用item-->
                      <el-input v-if="rangeScoreIndex % 2 === 0" v-model.number="rangeScoresConfigs[index].rangeScores[rangeScoreIndex]"
                                class="odd-input" placeholder="分数"
                                @blur="rangeConfigBlur(index)"></el-input>
                      <el-input v-else v-model.number="rangeScoresConfigs[index].rangeScores[rangeScoreIndex]"
                                class="even-input" placeholder="分界点"
                                @blur="rangeConfigBlur(index)"></el-input>
                    </el-form-item>
                  </el-col>

                </el-form>
                <el-col :span="2">
                  <el-button type="danger" icon="el-icon-minus" circle size="mini" plain
                             @click.prevent="removeRangeScore(index)"></el-button>
                  <el-button type="primary" icon="el-icon-plus" circle size="mini" plain
                             @click="addRangeScore(index)"></el-button>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="1" class="text-center">
                  <el-button type="danger" icon="el-icon-delete" size="mini" plain
                             @click.prevent="removeRangeConfig(rangeConfig)"></el-button>
                </el-col>
                <el-col :span="1" v-if="index === configDetail.rangeConfigs.length - 1">
                  <el-button type="primary" icon="el-icon-plus" size="mini" plain
                             @click="addRangeConfig"></el-button>
                </el-col>
              </el-row>
            </el-form>
          </el-form-item>
          <el-row v-if="configDetail.rangeConfigs.length === 0" class="text-center">
            <el-button type="primary" icon="el-icon-plus" size="mini" plain
                       @click="addRangeConfig"></el-button>
          </el-row>
          <el-row>
            <el-col :offset="2">
              <el-button type="info" @click="resetRangeConfigForm">重置</el-button>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>计算公式配置:</span>
            <el-button style="float: right; padding: 3px 0" type="text">配置说明</el-button>
          </div>
          <el-form-item
              v-for="(compuFormula, index) in configDetail.compuFormulas"
              :key="compuFormula.key">
            <el-form :model="compuFormula" label-width="100px" :rules="compuFormulaFormRules" ref="compuFormulaForm">
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-form-item label="输出对象名:" prop="targetName">
                    <el-input type="text" v-model="compuFormula.targetName" ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="计算公式:" prop="func">
                    <el-input type="text" v-model="compuFormula.func" ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="1" class="text-center">
                  <el-button type="danger" icon="el-icon-delete" size="mini" plain
                             @click.prevent="removeCompuFormula(compuFormula)"></el-button>
                </el-col>
                <el-col :span="1" v-if="index === configDetail.compuFormulas.length - 1">
                  <el-button type="primary" icon="el-icon-plus" size="mini" plain
                             @click="addCompuFormula"></el-button>
                </el-col>
              </el-row>
            </el-form>
          </el-form-item>
          <el-row v-if="configDetail.compuFormulas.length === 0" class="text-center">
            <el-button type="primary" icon="el-icon-plus" size="mini" plain
                       @click="addCompuFormula"></el-button>
          </el-row>
          <el-row>
            <el-col :offset="2">
              <el-button type="info" @click="resetCompuFormulaForm">重置</el-button>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="hover" class="flex-item">
            <el-button type="primary" @click="updateConfig">保 存</el-button>
            <el-button @click="goBack">取 消</el-button>
        </el-card>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import qs from "qs";
import {mapState} from "vuex";

export default {
  name: 'ConfigsDetail',
  props: ['id'],
  data() {
    let checkAttriConfigName = (rule, value, callback) => {
      let acIndex = 0
      for (let i = 0; i < this.configDetail.attriConfigs.length; i++) {
        if (this.configDetail.attriConfigs[i].name === value) {
          acIndex = i
        }
      }

      if (!this.attriConfigNames[acIndex]) {
        return callback(new Error('对象名是必填项'));
      }

      for (const attriConfig of this.configDetail.attriConfigs) {
        if (value !== this.attriConfigNames[acIndex] && attriConfig.name === this.attriConfigNames[acIndex]) {
          return callback(new Error('对象名已配置！'));
        }
      }
      callback();
    }
    let checkRangeConfigName = (rule, value, callback) => {
      let times = 0
      for (const rangeConfig of this.configDetail.rangeConfigs) {
        if (rangeConfig.targetName === value) {
          times++
        }
        // 和本身会有一次匹配
        if (times > 1) {
          return callback(new Error('对象名已配置！'));
        }
      }
      callback();
    }
    let checkCompuFormulaName = (rule, value, callback) => {
      let times = 0
      for (const compuFormula of this.configDetail.compuFormulas) {
        if (compuFormula.targetName === value) {
          times++
        }
        // 和本身会有一次匹配
        if (times > 1) {
          return callback(new Error('对象名已配置！'));
        }
      }
      callback();
    }
    return {
      configDetail: {
        id: 0,
        name: '',
        description:"",
        status: '',
        attriConfigs: [{
          name: '',
          fieldScores: [{
            filed: '',
            score: 0
          }]
        }],
        rangeConfigs: [{
          targetName: '',
          func:''
        }],
        compuFormulas: [{
          targetName: '',
          func:''
        }]
      },
      initialConfigDetail: '',
      // 属性名缓存，以免v-model直接更新tab导致输入一个字符更新一次
      attriConfigNames: [],
      // 指向当前标签页名
      attriEditableTabName: '',
      newAttriConfigIndex: 0,

      rangeScoresConfigs: [
        {rangeScores: []}
      ],
      // 表单的验证规则对象
      configFormRules: {
        name: [
          { required: true, message: '配置名是必填项', trigger: 'blur' },
          { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' },
        ],
      },
      attriConfigFormRules: {
        name: [
          { validator: checkAttriConfigName, required: true, trigger: 'blur' },
        ],
      },
      fieldScoreFormRules: {
        field: [
          { required: true, message: '属性名是必填项', trigger: 'blur' },
        ],
        score: [
          { required: true,  message: '属性得分是必填项', trigger: 'blur' },
          { type: 'number', message: '属性得分必须是数字', trigger: 'blur' },
        ],
      },
      rangeConfigFormRules: {
        targetName: [
          { required: true, message: '变量名是必填项', trigger: 'blur' },
          { validator: checkRangeConfigName, trigger: 'blur' },
        ],
        func: [
          { required: true, message: '范围得分配置是必填项', trigger: 'blur' },
        ]
      },
      rangeScoresFormRules: {
        rangeScores: [
          { required: true, message: '必填项', trigger: 'blur' },
          { type:'number', message: '必须是数字', trigger: 'blur' },
        ]
      },
      compuFormulaFormRules: {
        targetName: [
          { required: true, message: '输出变量名是必填项', trigger: 'blur' },
          { validator: checkCompuFormulaName, trigger: 'blur' },
        ],
        func: [
          { required: true, message: '计算公式是必填项', trigger: 'blur' },
        ]
      }
    }
  },
  created() {
    this.getConfigDetail()
  },
  computed: {
    ...mapState(['paramsName'])
  },
  beforeRouteLeave(to, from, next) {
    // 在离开页面前进行未保存数据的验证
    if (JSON.stringify(this.configDetail) !== this.initialConfigDetail) {
      // 如果表单数据发生了变化，则弹出确认框询问用户是否离开
      if (window.confirm('您有未保存的数据，确认离开吗？')) {
        // 用户确认离开，则继续路由跳转
        next();
      } else {
        // 用户取消离开，则取消路由跳转
        next(false);
      }
    } else {
      // 表单数据没有发生变化，则直接继续路由跳转
      next();
    }
  },
  methods: {
    async getConfigDetail() {
      const { data: res } = await this.$http.get('/valuation-configs/' + this.id)
      if (res.code !== 0) return this.$message.error('获取用户详情数据失败！')
      this.configDetail = res.data
      this.configDetail.id = this.id
      this.initialConfigDetail = JSON.stringify(this.configDetail)
      if (this.configDetail.attriConfigs.length !== 0) {
        this.attriEditableTabName = this.configDetail.attriConfigs[0].name
        this.attriConfigNames = this.configDetail.attriConfigs.map(item => item.name)
      }
      this.rangeScoresConfigs = []
      if (this.configDetail.rangeConfigs.length !== 0) {
        this.parseRangeConfigs(this.configDetail.rangeConfigs)
        // this.parseRangeTernary(this.removeBrackets("s1<200?(s1<100?0:100):200"))
      }
      console.log(this.configDetail)
    },

    updateConfig() {
      this.$refs.configForm.validate(async (valid) => {

        if (this.$refs.attriConfigForm !== undefined) {
          this.$refs.attriConfigForm.forEach((item, index) => {
            item.validate(async (attriConfigValid) => {
              if (!attriConfigValid) valid = false
            })
          })
        }
        if (this.$refs.fieldScoreForm !== undefined) {
          this.$refs.fieldScoreForm.forEach((item, index) => {
            item.validate(async (fieldScoreValid) => {
              if (!fieldScoreValid) valid = false
            })
          })
        }
        if (this.$refs.rangeConfigForm !== undefined) {
          this.$refs.rangeConfigForm.forEach((item, index) => {
            item.validate(async (rangeConfigValid) => {
              if (!rangeConfigValid) valid = false
            })
          })
        }
        if (this.$refs.compuFormulaForm !== undefined) {
          this.$refs.compuFormulaForm.forEach((item, index) => {
            item.validate(async (compuFormulaValid) => {
              if (!compuFormulaValid) valid = false
            })
          })
        }

        if (!valid) {
          this.$message.error("请按规则完整填写表单！")
          return
        }
        // 弹出确认提示框
        this.$confirm('确认保存?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          //配置点击确认按钮
          const {data: res} = await this.$http.put('/valuation-configs/' + this.id, this.configDetail)
          if (res.code !== 0) return this.$message.error('数据保存失败！' + res.msg)
          this.$message.success(this.configDetail.name + ' 保存成功！')
          this.initialConfigDetail = JSON.stringify(this.configDetail)
          this.$router.go(-1)
        }).catch(() => {
          //配置点击取消按钮
          this.$message({
            type: 'info',
            message: '已取消保存'
          });
        });
      })
    },

    attriTabsEdit(targetName, action) {
      if (action === 'add') {
        while (this.attriConfigNames.includes('New_Config_' + this.newAttriConfigIndex)) this.newAttriConfigIndex++
        let newTabName = 'New_Config_' + this.newAttriConfigIndex
        this.configDetail.attriConfigs.push({
          name: newTabName,
          fieldScores: []
        });
        this.attriEditableTabName = newTabName
        this.attriConfigNames.push(newTabName)
        this.newAttriConfigIndex++
      }
      if (action === 'remove') {
        // 弹出确认提示框
        this.$confirm('此操作将删除 ' + targetName + ' 配置所有数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          //配置点击确认按钮
          const acIndex = this.attriConfigNames.indexOf(targetName)
          if (acIndex !== -1) {
            this.attriConfigNames.splice(acIndex, 1)
            this.configDetail.attriConfigs.splice(acIndex, 1)
          }
          let nextTab = this.configDetail.attriConfigs[acIndex] || this.configDetail.attriConfigs[acIndex - 1]
          this.attriEditableTabName = nextTab.name
          this.$message.success('已删除属性标签：' + targetName)
        }).catch(() => {
          //配置点击取消按钮
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      }
    },
    attriTabClick(tab) {
      // this.attriConfigNames = tab.name
    },
    queryParamsName(queryName, cb) {
      let resNames = queryName ? this.paramsName.filter(this.nameFilter(queryName)) : this.paramsName;
      cb(resNames)
    },
    nameFilter(queryName) {
      return (paramsName) => {
        return (paramsName.value.toLowerCase().indexOf(queryName.toLowerCase()) !== -1);
      };
    },
    selectParamsName(item, acIndex) {
      // 对象名重复
      for (const attriConfig of this.configDetail.attriConfigs) {
        if (attriConfig.name === item.value) return
      }
      this.configDetail.attriConfigs[acIndex].name = item.value
      this.attriEditableTabName = item.value
      this.attriConfigNameBlur(acIndex, item.value)
    },
    attriConfigNameBlur(acIndex, attriConfigName) {
      // 等待失焦事件触发后，更新变量的值, 设置延迟优先select
      setTimeout(() => {
        // 对象名为空或重复
        if (!attriConfigName) return
        for (const attriConfig of this.configDetail.attriConfigs) {
          if (attriConfig.name === attriConfigName) return
        }
        this.configDetail.attriConfigs[acIndex].name = attriConfigName;
        this.attriEditableTabName = attriConfigName
      }, 200);
    },
    removeFieldScore(attriConfig, fieldScore) {
      let attriConfigIndex = this.configDetail.attriConfigs.indexOf(attriConfig)
      let fieldScoreIndex =  this.configDetail.attriConfigs[attriConfigIndex].fieldScores.indexOf(fieldScore)
      if (fieldScoreIndex !== -1) {
        this.configDetail.attriConfigs[attriConfigIndex].fieldScores.splice(fieldScoreIndex, 1)
      }
    },
    addFieldScore(attriConfig) {
      let attriConfigIndex = this.configDetail.attriConfigs.indexOf(attriConfig)
      this.configDetail.attriConfigs[attriConfigIndex].fieldScores.push({
        field: '',
        score: 0.0
      });
    },

    parseRangeConfigs(rangeConfigs) {
      rangeConfigs.forEach((rangeConfig, index) => {
        // 删除三元表达式括号
        const express = rangeConfig.func.replace(/[()]/g, '')
        this.rangeScoresConfigs.push({
          rangeScores: []
        })
        this.parseRangeTernary(express, index)
      })
    },
    // 递归解析嵌套的三元表达式
    parseRangeTernary(expression, index) {
      if (!expression.includes('?')) {
        this.rangeScoresConfigs[index].rangeScores.push(parseFloat(expression))
        return
      }

      const questionMarkIndex = expression.indexOf('?')
      const lessThanSignIndex = expression.indexOf('<')
      const cutOffPoint = expression.substring(lessThanSignIndex + 1, questionMarkIndex)
      const rest = expression.substring(questionMarkIndex + 1)
      const colonIndex = rest.lastIndexOf(':')
      if (colonIndex === -1) {
        throw new Error('三元表达式格式错误！')
      }

      const trueValue = rest.substring(0, colonIndex).trim()
      const falseValue = rest.substring(colonIndex + 1).trim()

      this.parseRangeTernary(trueValue, index)
      this.rangeScoresConfigs[index].rangeScores.push(parseFloat(cutOffPoint.trim()))
      this.parseRangeTernary(falseValue, index)
    },
    toRangeTernary(index) {
      let name = this.configDetail.rangeConfigs[index].targetName
      let config = this.rangeScoresConfigs[index]
      let express = config.rangeScores[0]
      for (let rangeScoreIndex = 1; rangeScoreIndex < config.rangeScores.length; rangeScoreIndex += 2) {
        express = '(' + name + '<' + config.rangeScores[rangeScoreIndex] + '?' + express + ':' + config.rangeScores[rangeScoreIndex + 1] + ')'
      }
      return express
    },
    rangeConfigBlur(index) {
      this.configDetail.rangeConfigs[index].func = this.toRangeTernary(index)
    },
    removeRangeScore(index) {
      if (this.rangeScoresConfigs[index].rangeScores.length > 3) {
        this.rangeScoresConfigs[index].rangeScores.pop()
        this.rangeScoresConfigs[index].rangeScores.pop()
        this.rangeConfigBlur(index)
      }
    },
    addRangeScore(index) {
      this.rangeScoresConfigs[index].rangeScores.push("")
      this.rangeScoresConfigs[index].rangeScores.push("")
    },
    removeRangeConfig(item) {
      let index = this.configDetail.rangeConfigs.indexOf(item)
      if (index !== -1) {
        this.configDetail.rangeConfigs.splice(index, 1)
        this.rangeScoresConfigs.splice(index, 1)
      }
    },
    addRangeConfig() {
      this.configDetail.rangeConfigs.push({
        targetName: '',
        func: ''
      });
      this.rangeScoresConfigs.push({
        rangeScores: []
      })
      this.rangeScoresConfigs[this.rangeScoresConfigs.length - 1].rangeScores.push("")
      this.addRangeScore(this.rangeScoresConfigs.length - 1)
    },
    resetRangeConfigForm(formName) {
      // 弹出确认提示框
      this.$confirm('此操作将删除范围配置所有数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        //配置点击确认按钮
        this.configDetail.rangeConfigs = []
        this.rangeScoresConfigs = []
        this.$message.success('重置成功！')
      }).catch(() => {
        //配置点击取消按钮
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    removeCompuFormula(item) {
      let index = this.configDetail.compuFormulas.indexOf(item)
      if (index !== -1) {
        this.configDetail.compuFormulas.splice(index, 1)
      }
    },
    addCompuFormula() {
      this.configDetail.compuFormulas.push({
        targetName: '',
        func: ''
      });
    },
    resetCompuFormulaForm(formName) {
      // 弹出确认提示框
      this.$confirm('此操作将删除计算配置所有数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        //配置点击确认按钮
        /*this.$refs[formName].resetFields();
      this.$refs.compuFormulasForm.resetFields()*/
        this.configDetail.compuFormulas = []
        this.$message.success('重置成功！')
      }).catch(() => {
        //配置点击取消按钮
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    goBack() {
      this.$router.go(-1)
    },
  },
}
</script>

<style lang="less" scoped>
.flex-container {
  display: flex;
  justify-content: space-evenly;
}

.flex-item {
  display: flex;
  justify-content: space-evenly;
}

.text-center {
  text-align: center;
  align-items: center;
}
.odd-input {
  text-align: center;
}
/deep/ .odd-input .el-input__inner {
  text-align: center;
}
.even-input {
  height: 40px;
  text-align: center;
}
/deep/ .even-input .el-input__inner {
  width: 80%;
  height: 80%;
  background-color: #E9EEF3;
  text-align: center;
}

</style>