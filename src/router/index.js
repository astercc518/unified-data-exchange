import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'navbar.dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/guide',
    component: Layout,
    hidden: true, // 隐藏引导页
    children: [
      {
        path: 'index',
        component: () => import('@/views/guide/index'),
        name: 'Guide',
        meta: { title: 'navbar.guide', icon: 'guide', noCache: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'navbar.profile', icon: 'user', noCache: true }
      }
    ]
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  // 用户管理（包含客户、代理和结算）
  {
    path: '/user',
    component: Layout,
    redirect: '/user/customer-list',
    alwaysShow: true,
    name: 'UserManagement',
    meta: {
      title: 'navbar.userManagement',
      icon: 'peoples',
      roles: ['admin', 'agent'] // 代理可查看客户列表
    },
    children: [
      {
        path: 'customer-list',
        component: () => import('@/views/user/list'),
        name: 'CustomerList',
        meta: {
          title: 'navbar.customerList',
          roles: ['admin', 'agent'] // 代理可查看本代理下的客户
        }
      },
      {
        path: 'agent-list',
        component: () => import('@/views/agent/list'),
        name: 'AgentList',
        meta: {
          title: 'navbar.agentList',
          roles: ['admin'] // 仅管理员
        }
      },
      {
        path: 'recharge-record',
        component: () => import('@/views/recharge/record'),
        name: 'RechargeRecord',
        meta: {
          title: 'navbar.rechargeRecord',
          roles: ['admin'] // 仅管理员
        }
      },
      {
        path: 'customer-settlement',
        component: () => import('@/views/settlement/user'),
        name: 'CustomerSettlement',
        meta: {
          title: 'navbar.customerSettlement',
          roles: ['admin', 'agent'] // 代理只看本代理的客户结算
        }
      },
      {
        path: 'agent-settlement',
        component: () => import('@/views/settlement/agent'),
        name: 'AgentSettlement',
        meta: {
          title: 'navbar.agentSettlement',
          roles: ['admin'] // 仅管理员
        }
      },
      {
        path: 'customer/create',
        component: () => import('@/views/user/create'),
        name: 'CreateCustomer',
        meta: {
          title: 'navbar.createCustomer',
          activeMenu: '/user/customer-list'
        },
        hidden: true
      },
      {
        path: 'customer/edit/:id(\\d+)',
        component: () => import('@/views/user/edit'),
        name: 'EditCustomer',
        meta: {
          title: 'navbar.editCustomer',
          activeMenu: '/user/customer-list'
        },
        hidden: true
      },
      {
        path: 'customer/detail/:id(\\d+)',
        component: () => import('@/views/user/detail'),
        name: 'CustomerDetail',
        meta: {
          title: 'navbar.customerDetail',
          activeMenu: '/user/customer-list',
          roles: ['admin', 'agent'] // 代理可查看客户详情
        },
        hidden: true
      },
      {
        path: 'agent/create',
        component: () => import('@/views/agent/create'),
        name: 'CreateAgent',
        meta: {
          title: 'navbar.createAgent',
          activeMenu: '/user/agent-list'
        },
        hidden: true
      },
      {
        path: 'agent/edit/:id(\\d+)',
        component: () => import('@/views/agent/edit'),
        name: 'EditAgent',
        meta: {
          title: 'navbar.editAgent',
          activeMenu: '/user/agent-list'
        },
        hidden: true
      },
      {
        path: 'agent/detail/:id(\\d+)',
        component: () => import('@/views/agent/detail'),
        name: 'AgentDetail',
        meta: {
          title: 'navbar.agentDetail',
          activeMenu: '/user/agent-list'
        },
        hidden: true
      },
      {
        path: 'customer/recharge/:id(\\d+)',
        component: () => import('@/views/user/recharge'),
        name: 'CustomerRecharge',
        meta: {
          title: 'navbar.customerRecharge',
          activeMenu: '/user/customer-list'
        },
        hidden: true
      },
      {
        path: 'agent/recharge/:id(\\d+)',
        component: () => import('@/views/agent/recharge'),
        name: 'AgentRecharge',
        meta: {
          title: 'navbar.agentRecharge',
          activeMenu: '/user/agent-list'
        },
        hidden: true
      }
    ]
  },

  // 数据管理
  {
    path: '/data',
    component: Layout,
    redirect: '/data/upload',
    alwaysShow: true,
    name: 'DataManagement',
    meta: {
      title: 'navbar.dataManagement',
      icon: 'database',
      roles: ['admin', 'agent', 'customer'] // 所有角色都可访问数据管理模块
    },
    children: [
      {
        path: 'upload',
        component: () => import('@/views/data/upload'),
        name: 'DataUpload',
        meta: {
          title: 'navbar.dataUpload',
          icon: 'upload',
          roles: ['admin'] // 仅管理员可访问
        }
      },
      {
        path: 'library',
        component: () => import('@/views/data/library'),
        name: 'DataLibrary',
        meta: {
          title: 'navbar.dataLibrary',
          icon: 'library',
          roles: ['admin'] // 仅管理员可访问
        }
      },
      {
        path: 'pricing',
        component: () => import('@/views/data/pricing'),
        name: 'DataPricing',
        meta: {
          title: 'navbar.dataPricing',
          icon: 'money',
          roles: ['admin'] // 仅管理员可访问
        }
      },
      {
        path: 'test',
        component: () => import('@/views/data/publishTest'),
        name: 'PublishTest',
        meta: {
          title: 'navbar.publishTest',
          icon: 'bug',
          roles: ['admin'] // 仅管理员可访问
        }
      },
      {
        path: 'processing',
        component: () => import('@/views/data/processing'),
        name: 'DataProcessing',
        meta: {
          title: 'navbar.dataProcessing',
          icon: 'setting',
          roles: ['admin', 'agent', 'customer'] // 所有用户都可以使用数据处理功能
        }
      }
    ]
  },

  // 资源中心（客户端）
  {
    path: '/resource',
    component: Layout,
    redirect: '/resource/center',
    alwaysShow: true,
    name: 'ResourceCenter',
    meta: {
      title: 'navbar.resourceCenter',
      icon: 'shopping',
      roles: ['admin', 'customer', 'agent'] // 管理员、客户和代理可查看
    },
    children: [
      {
        path: 'center',
        component: () => import('@/views/resource/center'),
        name: 'ResourceCenterMain',
        meta: {
          title: 'navbar.resourceCenterMain',
          icon: 'shop',
          roles: ['admin', 'customer', 'agent']
        }
      },
      {
        path: 'subscription',
        component: () => import('@/views/resource/subscription'),
        name: 'SubscriptionCenter',
        meta: {
          title: 'navbar.subscriptionCenter',
          icon: 'star',
          roles: ['customer'] // 仅客户可访问订阅中心
        }
      },
      {
        path: 'purchase/:id(\\d+)',
        component: () => import('@/views/resource/purchase'),
        name: 'ResourcePurchase',
        hidden: true,
        meta: {
          title: 'navbar.resourcePurchase',
          roles: ['customer'] // 仅客户可购买
        }
      }
    ]
  },

  // 订单管理
  {
    path: '/order',
    component: Layout,
    redirect: '/order/list',
    alwaysShow: true,
    name: 'OrderManagement',
    meta: {
      title: 'navbar.orderManagement',
      icon: 'list',
      roles: ['admin', 'customer', 'agent']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/order/list'),
        name: 'OrderList',
        meta: {
          title: 'navbar.orderList',
          icon: 'order'
        }
      },
      {
        path: 'pending',
        component: () => import('@/views/order/pending'),
        name: 'PendingOrders',
        meta: {
          title: 'navbar.pendingOrders',
          icon: 'time',
          roles: ['customer']
        }
      },
      {
        path: 'review',
        component: () => import('@/views/order/review'),
        name: 'ReviewOrders',
        meta: {
          title: 'navbar.reviewOrders',
          icon: 'document-checked',
          roles: ['agent', 'admin'] // 代理和管理员可审核订单
        }
      },
      {
        path: 'completed',
        component: () => import('@/views/order/completed'),
        name: 'CompletedOrders',
        meta: {
          title: 'navbar.completedOrders',
          icon: 'circle-check'
        }
      },
      {
        path: 'delivery/:id(\\d+)',
        component: () => import('@/views/order/delivery'),
        name: 'OrderDelivery',
        meta: {
          title: 'navbar.orderDelivery',
          roles: ['agent', 'admin']
        },
        hidden: true
      },
      {
        path: 'detail/:id(\\d+)',
        component: () => import('@/views/order/detail'),
        name: 'OrderDetail',
        meta: {
          title: 'navbar.orderDetail'
        },
        hidden: true
      }
    ]
  },

  // 数据反馈
  {
    path: '/feedback',
    component: Layout,
    redirect: '/feedback/list',
    alwaysShow: true,
    name: 'DataFeedback',
    meta: {
      title: 'navbar.dataFeedback',
      icon: 'message',
      roles: ['admin', 'customer', 'agent'] // 客户和代理可访问
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/feedback/list'),
        name: 'FeedbackList',
        meta: {
          title: 'navbar.feedbackList',
          icon: 'list',
          roles: ['admin', 'customer', 'agent'] // 代理只看本代理客户的反馈
        }
      },
      {
        path: 'create',
        component: () => import('@/views/feedback/create'),
        name: 'CreateFeedback',
        meta: {
          title: 'navbar.createFeedback',
          icon: 'edit',
          roles: ['customer'] // 仅客户可创建反馈
        }
      },
      {
        path: 'detail/:id(\\d+)',
        component: () => import('@/views/feedback/detail'),
        name: 'FeedbackDetail',
        hidden: true,
        meta: {
          title: 'navbar.feedbackDetail',
          roles: ['admin', 'customer', 'agent']
        }
      }
    ]
  },

  // 短信管理（管理员）
  {
    path: '/sms/admin',
    component: Layout,
    redirect: '/sms/admin/channels',
    alwaysShow: true,
    name: 'SmsAdminManagement',
    meta: {
      title: '短信管理',
      icon: 'message',
      roles: ['admin']
    },
    children: [
      {
        path: 'channels',
        component: () => import('@/views/sms/admin/channels'),
        name: 'SmsChannels',
        meta: {
          title: '通道配置',
          icon: 'link',
          roles: ['admin']
        }
      },
      {
        path: 'records',
        component: () => import('@/views/sms/admin/records'),
        name: 'SmsAdminRecords',
        meta: {
          title: '发送记录',
          icon: 'documentation',
          roles: ['admin']
        }
      },
      {
        path: 'statistics',
        component: () => import('@/views/sms/admin/statistics'),
        name: 'SmsAdminStatistics',
        meta: {
          title: '短信统计',
          icon: 'chart',
          roles: ['admin']
        }
      },
      {
        path: 'settlements',
        component: () => import('@/views/sms/settlement/index'),
        name: 'SmsSettlements',
        meta: {
          title: '客户结算',
          icon: 'money',
          roles: ['admin']
        }
      },
      {
        path: 'agent-settlement',
        component: () => import('@/views/sms/agentSettlement/index'),
        name: 'SmsAgentSettlement',
        meta: {
          title: '代理结算',
          icon: 'peoples',
          roles: ['admin']
        }
      },
      {
        path: 'channel-settlement',
        component: () => import('@/views/sms/channelSettlement/index'),
        name: 'SmsChannelSettlement',
        meta: {
          title: '通道结算',
          icon: 'link',
          roles: ['admin']
        }
      },
      {
        path: 'settlements/:id',
        component: () => import('@/views/sms/settlement/details'),
        name: 'SmsSettlementDetails',
        hidden: true,
        meta: {
          title: '结算明细',
          roles: ['admin']
        }
      }
    ]
  },

  // 短信发送（客户）
  {
    path: '/sms/customer',
    component: Layout,
    redirect: '/sms/customer/send',
    alwaysShow: true,
    name: 'SmsCustomerManagement',
    meta: {
      title: '短信发送',
      icon: 'message',
      roles: ['customer']
    },
    children: [
      {
        path: 'send',
        component: () => import('@/views/sms/customer/send'),
        name: 'SmsSend',
        meta: {
          title: '短信群发',
          icon: 'send',
          roles: ['customer']
        }
      },
      {
        path: 'tasks',
        component: () => import('@/views/sms/customer/tasks'),
        name: 'SmsTasks',
        meta: {
          title: '任务管理',
          icon: 'list',
          roles: ['customer']
        }
      },
      {
        path: 'records',
        component: () => import('@/views/sms/customer/records'),
        name: 'SmsCustomerRecords',
        meta: {
          title: '发送记录',
          icon: 'documentation',
          roles: ['customer']
        }
      },
      {
        path: 'statistics',
        component: () => import('@/views/sms/customer/statistics'),
        name: 'SmsCustomerStatistics',
        meta: {
          title: '数据统计',
          icon: 'chart',
          roles: ['customer']
        }
      }
    ]
  },

  // 系统管理 (移到最后)
  {
    path: '/system',
    component: Layout,
    redirect: '/system/permission',
    alwaysShow: true,
    name: 'SystemManagement',
    meta: {
      title: 'navbar.systemManagement',
      icon: 'tree',
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'config',
        component: () => import('@/views/system/config'),
        name: 'SystemConfig',
        meta: {
          title: '系统配置',
          icon: 'setting',
          roles: ['admin']
        }
      },
      {
        path: 'server-status',
        component: () => import('@/views/system/server-status'),
        name: 'ServerStatus',
        meta: {
          title: '服务器状态',
          icon: 'server',
          roles: ['admin']
        }
      },
      {
        path: 'backup',
        component: () => import('@/views/system/backup'),
        name: 'SystemBackup',
        meta: {
          title: '系统备份',
          icon: 'files',
          roles: ['admin']
        }
      },
      {
        path: 'logs',
        component: () => import('@/views/system/logs'),
        name: 'OperationLogs',
        meta: {
          title: '操作日志',
          icon: 'documentation',
          roles: ['admin']
        }
      },
      {
        path: 'password',
        component: () => import('@/views/system/password'),
        name: 'ChangePassword',
        meta: {
          title: '修改密码',
          icon: 'lock',
          roles: ['admin']
        }
      },
      {
        path: 'security',
        component: () => import('@/views/system/security'),
        name: 'SystemSecurity',
        meta: {
          title: '安全管理',
          icon: 'shield',
          roles: ['admin']
        }
      },
      {
        path: 'delivery-config',
        component: () => import('@/views/system/delivery-config'),
        name: 'DeliveryConfig',
        meta: {
          title: '发货配置',
          icon: 'message',
          roles: ['admin']
        }
      },
      {
        path: 'permission',
        component: () => import('@/views/permission/page'),
        name: 'SystemPermission',
        redirect: '/system/permission/page',
        hidden: true,
        meta: {
          title: 'navbar.permission',
          icon: 'lock'
        },
        children: [
          {
            path: 'page',
            component: () => import('@/views/permission/page'),
            name: 'PagePermission',
            meta: {
              title: 'navbar.pagePermission',
              roles: ['admin']
            }
          },
          {
            path: 'directive',
            component: () => import('@/views/permission/directive'),
            name: 'DirectivePermission',
            meta: {
              title: 'navbar.directivePermission'
            }
          },
          {
            path: 'role',
            component: () => import('@/views/permission/role'),
            name: 'RolePermission',
            meta: {
              title: 'navbar.rolePermission',
              roles: ['admin']
            }
          }
        ]
      },
      {
        path: 'icons',
        component: () => import('@/views/icons/index'),
        name: 'SystemIcons',
        hidden: true,
        meta: { title: 'navbar.icons', icon: 'icon', noCache: true }
      },
      {
        path: 'components',
        name: 'SystemComponents',
        redirect: '/system/components/tinymce',
        hidden: true,
        meta: { title: 'navbar.components', icon: 'component' },
        children: [
          {
            path: 'tinymce',
            component: () => import('@/views/components-demo/tinymce'),
            name: 'TinymceDemo',
            meta: { title: 'navbar.tinymce' }
          },
          {
            path: 'markdown',
            component: () => import('@/views/components-demo/markdown'),
            name: 'MarkdownDemo',
            meta: { title: 'navbar.markdown' }
          },
          {
            path: 'json-editor',
            component: () => import('@/views/components-demo/json-editor'),
            name: 'JsonEditorDemo',
            meta: { title: 'navbar.jsonEditor' }
          },
          {
            path: 'split-pane',
            component: () => import('@/views/components-demo/split-pane'),
            name: 'SplitpaneDemo',
            meta: { title: 'navbar.splitPane' }
          },
          {
            path: 'avatar-upload',
            component: () => import('@/views/components-demo/avatar-upload'),
            name: 'AvatarUploadDemo',
            meta: { title: 'navbar.avatarUpload' }
          },
          {
            path: 'dropzone',
            component: () => import('@/views/components-demo/dropzone'),
            name: 'DropzoneDemo',
            meta: { title: 'navbar.dropzone' }
          },
          {
            path: 'sticky',
            component: () => import('@/views/components-demo/sticky'),
            name: 'StickyDemo',
            meta: { title: 'navbar.sticky' }
          },
          {
            path: 'count-to',
            component: () => import('@/views/components-demo/count-to'),
            name: 'CountToDemo',
            meta: { title: 'navbar.countTo' }
          },
          {
            path: 'mixin',
            component: () => import('@/views/components-demo/mixin'),
            name: 'ComponentMixinDemo',
            meta: { title: 'navbar.componentMixin' }
          },
          {
            path: 'back-to-top',
            component: () => import('@/views/components-demo/back-to-top'),
            name: 'BackToTopDemo',
            meta: { title: 'navbar.backToTop' }
          },
          {
            path: 'drag-dialog',
            component: () => import('@/views/components-demo/drag-dialog'),
            name: 'DragDialogDemo',
            meta: { title: 'navbar.dragDialog' }
          },
          {
            path: 'drag-select',
            component: () => import('@/views/components-demo/drag-select'),
            name: 'DragSelectDemo',
            meta: { title: 'navbar.dragSelect' }
          },
          {
            path: 'dnd-list',
            component: () => import('@/views/components-demo/dnd-list'),
            name: 'DndListDemo',
            meta: { title: 'navbar.dragKanban' }
          },
          {
            path: 'drag-kanban',
            component: () => import('@/views/components-demo/drag-kanban'),
            name: 'DragKanbanDemo',
            meta: { title: 'navbar.dragKanban' }
          }
        ]
      },
      {
        path: 'charts',
        name: 'SystemCharts',
        redirect: '/system/charts/keyboard',
        hidden: true,
        meta: { title: 'navbar.charts', icon: 'chart' },
        children: [
          {
            path: 'keyboard',
            component: () => import('@/views/charts/keyboard'),
            name: 'KeyboardChart',
            meta: { title: 'navbar.keyboardChart', noCache: true }
          },
          {
            path: 'line',
            component: () => import('@/views/charts/line'),
            name: 'LineChart',
            meta: { title: 'navbar.lineChart', noCache: true }
          },
          {
            path: 'mix-chart',
            component: () => import('@/views/charts/mix-chart'),
            name: 'MixChart',
            meta: { title: 'navbar.mixChart', noCache: true }
          }
        ]
      },
      {
        path: 'nested',
        name: 'SystemNested',
        redirect: '/system/nested/menu1',
        hidden: true,
        meta: { title: 'Nested Routes', icon: 'nested' },
        children: [
          {
            path: 'menu1',
            component: () => import('@/views/nested/menu1/index'),
            name: 'Menu1',
            redirect: '/system/nested/menu1/menu1-1',
            meta: { title: 'Menu 1' },
            children: [
              {
                path: 'menu1-1',
                component: () => import('@/views/nested/menu1/menu1-1'),
                name: 'Menu1-1',
                meta: { title: 'Menu 1-1' }
              },
              {
                path: 'menu1-2',
                component: () => import('@/views/nested/menu1/menu1-2'),
                name: 'Menu1-2',
                redirect: '/system/nested/menu1/menu1-2/menu1-2-1',
                meta: { title: 'Menu 1-2' },
                children: [
                  {
                    path: 'menu1-2-1',
                    component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
                    name: 'Menu1-2-1',
                    meta: { title: 'Menu 1-2-1' }
                  },
                  {
                    path: 'menu1-2-2',
                    component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
                    name: 'Menu1-2-2',
                    meta: { title: 'Menu 1-2-2' }
                  }
                ]
              },
              {
                path: 'menu1-3',
                component: () => import('@/views/nested/menu1/menu1-3'),
                name: 'Menu1-3',
                meta: { title: 'Menu 1-3' }
              }
            ]
          },
          {
            path: 'menu2',
            name: 'Menu2',
            component: () => import('@/views/nested/menu2/index'),
            meta: { title: 'Menu 2' }
          }
        ]
      }
    ]
  }
]
