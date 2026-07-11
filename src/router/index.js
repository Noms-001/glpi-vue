import {
    createRouter,
    createWebHistory
} from 'vue-router'

import ComponentsTest from '../views/ComponentsTest.vue'
import Test from '../views/Test.vue'
import Login from '../views/backoffice/Login.vue'
import ImportPage from '../views/backoffice/Import.vue'
import Dashboard from '../views/backoffice/Dashboard.vue'
import TicketList from '../views/backoffice/tickets/Liste.vue'
import TicketFiche from '../views/backoffice/tickets/Fiche.vue'
import StatusLanguage from '../views/backoffice/StatusLanguage.vue'
import StatusColor from '../views/backoffice/StatusColor.vue'
import TicketFormulaire from '../views/frontoffice/tickets/Formulaire.vue'
import TicketKanban from '../views/frontoffice/tickets/Kanban.vue'
import FrontItemsList from '../views/frontoffice/items/Liste.vue'
import { isAuthenticated } from '../api/auth.js'
import SommeCout from '../views/frontoffice/tickets/SommeCout.vue'
import ImportMouvement from '../views/backoffice/ImportMouvement.vue'
import ListCost from '../views/frontoffice/tickets/ListCost.vue'

const router = createRouter({

    history: createWebHistory(),

    routes: [

        {
            path: '/',
            redirect: '/items'
        },

        {
            path: '/backoffice/login',
            name: 'login',
            component: Login
        },
        {
            path: '/backoffice/test',
            name: 'backofficeTest',
            component: Test,
            meta: { requiresAuth: true }
        },
        {
            path: '/backoffice/dashboard',
            name: 'Dashoard',
            component: Dashboard,
            meta: { requiresAuth: true }
        },

        {
            path: '/backoffice/tickets',
            name: 'backofficeTickets',
            component: TicketList,
            meta: { requiresAuth: true }
        },
        {
            path: '/tickets/new',
            name: 'backofficeTicketCreate',
            component: TicketFormulaire
        },
        {
            path: '/tickets/kanban',
            name: 'frontofficeTicketKanban',
            component: TicketKanban
        },

        {
            path: '/items',
            name: 'frontofficeItems',
            component: FrontItemsList
        },

        {
            path: '/backoffice/tickets/:id',
            name: 'backofficeTicketFiche',
            component: TicketFiche,
            meta: { requiresAuth: true }
        },

        {
            path: '/backoffice/import',
            name: 'backofficeImport',
            component: ImportPage,
            meta: { requiresAuth: true }
        },
        {
            path: '/backoffice/import-mvt',
            component: ImportMouvement,
            meta: { requiresAuth: true }
        },
        {
            path: '/backoffice/status-language',
            name: 'backofficeStatusLanguage',
            component: StatusLanguage,
            meta: { requiresAuth: true }
        },
        {
            path: '/backoffice/status-color',
            name: 'backofficeStatusColor',
            component: StatusColor,
            meta: { requiresAuth: true }
        },
        {
            path: '/tickets/sum-cost',
            component: SommeCout
        },
        {
            path: '/tickets/costs',
            component: ListCost
        },
        {
            path: '/components-test',
            name: 'componentsTest',
            component: ComponentsTest
        }
    ]
})

router.beforeEach((to) => {
    
    const isBackofficeRoute = to.path.startsWith('/backoffice')
    const isLoginPage = to.path === '/backoffice/login'
    const isAuthenticate = isAuthenticated()
    
    if(isLoginPage && isAuthenticate) {
        return '/backoffice/dashboard'
    }

    if (isBackofficeRoute && !isLoginPage) {

        if (to.meta.requiresAuth && !isAuthenticate) {
            return '/backoffice/login'
        }
    }

    return true
})

export default router