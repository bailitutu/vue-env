import Vue from 'vue';
import layout from '@components/layout/layout';
import { PRE_ROUTER_URL } from '../constants/constants';
import { loginConfig } from '../containers/login/app';
import { tplConfig } from '../containers/__tpl__/app';
import { settingConfig } from '../containers/setting/app';

export const dynamicRoutes = {
	tpl: tplConfig,
	setting: settingConfig,
};
export const basicRoutes = {
	base: PRE_ROUTER_URL,
	mode: 'history',
	routes: [
		...loginConfig,
		{
			path: '*',
			redirect: (to) => {
				return '/login';
			}
		}
	]
};
