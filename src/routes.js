/* eslint-disable */
import CompetitorComparisonHome from './components/CompetitorComparisonHome.vue';
import DashboardHome from './components/DashboardHome.vue';
import LoginHome from './components/LoginHome.vue';
import SettingsHome from './components/SettingsHome.vue';
import TweetCategoryHome from './components/TweetCategoryHome.vue';
export const routes = [{
    path: '',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    component: DashboardHome
  },
  {
    path: '/login',
    component: LoginHome
  },
  {
    path: '/problemReports',
    component: TweetCategoryHome
  },
  {
    path: '/inquiries',
    component: TweetCategoryHome
  },
  {
    path: '/comparison',
    component: CompetitorComparisonHome
  },
  {
    path: '/settings',
    component: SettingsHome
  },
  {
    path: '*',
    redirect: '/dashboard'
  }
];