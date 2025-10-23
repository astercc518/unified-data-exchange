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
    path: '/documentation',
    component: Layout,
    hidden: true, // 隐藏文档页面
    children: [
      {
        path: 'index',
        component: () => import('@/views/documentation/index'),
        name: 'Documentation',
        meta: { title: 'navbar.documentation', icon: 'documentation', affix: true }
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

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  // 用户管理
  {
    path: '/user',
    component: Layout,
    redirect: '/user/list',
    alwaysShow: true,
    name: 'UserManagement',
    meta: {
      title: 'navbar.userManagement',
      icon: 'peoples',
      roles: ['admin']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/user/list'),
        name: 'UserList',
        meta: {
          title: 'navbar.userList'
        }
      },
      {
        path: 'create',
        component: () => import('@/views/user/create'),
        name: 'CreateUser',
        meta: {
          title: 'navbar.createUser'
        }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/user/edit'),
        name: 'EditUser',
        meta: {
          title: 'navbar.editUser',
          hidden: true
        }
      },
      {
        path: 'detail/:id(\\d+)',
        component: () => import('@/views/user/detail'),
        name: 'UserDetail',
        meta: {
          title: 'navbar.userDetail',
          hidden: true
        }
      },
      {
        path: 'recharge/:id(\\d+)',
        component: () => import('@/views/user/recharge'),
        name: 'UserRecharge',
        meta: {
          title: 'navbar.userRecharge',
          hidden: true
        }
      }
    ]
  },

  // 代理管理
  {
    path: '/agent',
    component: Layout,
    redirect: '/agent/list',
    alwaysShow: true,
    name: 'AgentManagement',
    meta: {
      title: 'navbar.agentManagement',
      icon: 'peoples',
      roles: ['admin']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/agent/list'),
        name: 'AgentList',
        meta: {
          title: 'navbar.agentList'
        }
      },
      {
        path: 'create',
        component: () => import('@/views/agent/create'),
        name: 'CreateAgent',
        meta: {
          title: 'navbar.createAgent'
        }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/agent/edit'),
        name: 'EditAgent',
        meta: {
          title: 'navbar.editAgent',
          hidden: true
        }
      },
      {
        path: 'detail/:id(\\d+)',
        component: () => import('@/views/agent/detail'),
        name: 'AgentDetail',
        meta: {
          title: 'navbar.agentDetail',
          hidden: true
        }
      },
      {
        path: 'recharge/:id(\\d+)',
        component: () => import('@/views/agent/recharge'),
        name: 'AgentRecharge',
        meta: {
          title: 'navbar.agentRecharge',
          hidden: true
        }
      }
    ]
  },

  // 结算管理
  {
    path: '/settlement',
    component: Layout,
    redirect: '/settlement/user',
    alwaysShow: true,
    name: 'SettlementManagement',
    meta: {
      title: 'navbar.settlementManagement',
      icon: 'money',
      roles: ['admin']
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/settlement/user'),
        name: 'UserSettlement',
        meta: {
          title: 'navbar.userSettlement',
          icon: 'user'
        }
      },
      {
        path: 'agent',
        component: () => import('@/views/settlement/agent'),
        name: 'AgentSettlement',
        meta: {
          title: 'navbar.agentSettlement',
          icon: 'peoples'
        }
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
      roles: ['admin']
    },
    children: [
      {
        path: 'upload',
        component: () => import('@/views/data/upload'),
        name: 'DataUpload',
        meta: {
          title: 'navbar.dataUpload',
          icon: 'upload'
        }
      },
      {
        path: 'library',
        component: () => import('@/views/data/library'),
        name: 'DataLibrary',
        meta: {
          title: 'navbar.dataLibrary',
          icon: 'library'
        }
      },
      {
        path: 'pricing',
        component: () => import('@/views/data/pricing'),
        name: 'DataPricing',
        meta: {
          title: 'navbar.dataPricing',
          icon: 'money'
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
      roles: ['customer', 'agent']
    },
    children: [
      {
        path: 'center',
        component: () => import('@/views/resource/center'),
        name: 'ResourceCenterMain',
        meta: {
          title: 'navbar.resourceCenterMain',
          icon: 'shop'
        }
      },
      {
        path: 'purchase/:id(\\d+)',
        component: () => import('@/views/resource/purchase'),
        name: 'ResourcePurchase',
        meta: {
          title: 'navbar.resourcePurchase',
          hidden: true
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
        path: 'detail/:id(\\d+)',
        component: () => import('@/views/order/detail'),
        name: 'OrderDetail',
        meta: {
          title: 'navbar.orderDetail',
          hidden: true
        }
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
      roles: ['admin', 'customer', 'agent']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/feedback/list'),
        name: 'FeedbackList',
        meta: {
          title: 'navbar.feedbackList',
          icon: 'list'
        }
      },
      {
        path: 'create',
        component: () => import('@/views/feedback/create'),
        name: 'CreateFeedback',
        meta: {
          title: 'navbar.createFeedback',
          icon: 'edit'
        }
      },
      {
        path: 'detail/:id(\\d+)',
        component: () => import('@/views/feedback/detail'),
        name: 'FeedbackDetail',
        meta: {
          title: 'navbar.feedbackDetail',
          hidden: true
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
        path: 'permission',
        component: () => import('@/views/permission/page'),
        name: 'SystemPermission',
        redirect: '/system/permission/page',
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
        meta: { title: 'navbar.icons', icon: 'icon', noCache: true }
      },
      {
        path: 'components',
        name: 'SystemComponents',
        redirect: '/system/components/tinymce',
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
