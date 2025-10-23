<template>
  <div class="dashboard-container">
    <!-- 管理员Dashboard -->
    <admin-dashboard v-if="currentRole === 'admin'" />
    <!-- 代理Dashboard -->
    <agent-dashboard v-else-if="currentRole === 'agent'" />
    <!-- 客户Dashboard -->
    <customer-dashboard v-else-if="currentRole === 'customer'" />
    <!-- 默认Dashboard -->
    <admin-dashboard v-else />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AdminDashboard from './admin/index'
import AgentDashboard from './agent'
import CustomerDashboard from './customer'

export default {
  name: 'Dashboard',
  components: {
    AdminDashboard,
    AgentDashboard,
    CustomerDashboard
  },
  computed: {
    ...mapGetters([
      'roles'
    ]),
    currentRole() {
      if (this.roles.includes('admin')) {
        return 'admin'
      } else if (this.roles.includes('agent')) {
        return 'agent'
      } else if (this.roles.includes('customer')) {
        return 'customer'
      }
      return 'admin' // 默认显示管理员界面
    }
  }
}
</script>
