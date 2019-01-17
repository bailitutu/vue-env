import { Socket } from 'wya-socket';
import { URL_WEBSOCKET } from '@constants/constants';
import { isEqualWith } from 'lodash';
import { getItem, setItem, objRegex } from '@utils/utils';
import API_ROOT from '@stores/apis/root';

export const serviceObj = {
	param: {},
	res: undefined
};

export const serviceCompare = (newParam, localObj) => {
	return isEqualWith(newParam, localObj.param)
		? localObj.res
		: undefined;
};

export const serviceManager = {
	cbs: [],
	add(cb) {
		this.cbs.push(cb);
	},
	clear() {
		this.cbs.forEach(cb => cb());
		this.cbs = [];
	}
};

export const createService = (defaultOptions = {}) => {
	const {
		key, 
		url, 
		parser = null, 
		cache = false, 
		vuex = false,
		param: defaultParam = {},
		getParam = (instance) => ({}),
	} = defaultOptions;
	let store;
	cache && (store = getItem(`${key}_${_global.version}`));
	store = store || { ...serviceObj };

	// clear
	!cache && serviceManager.add(() => {
		store = { ...serviceObj };
	});

	
	return { 
		[key]: (userOptions = {}) => {
			const options = { ...defaultOptions, ...userOptions };
			const { autoLoad = true } = options;
			// 方法首字母大写
			const strFn = key.charAt(0).toUpperCase() + key.slice(1);

			const loadKey = `load${strFn}`;
			const clearKey = `clear${strFn}`;
			const loadingKey = `loading${strFn}`;

			return {
				data() {
					return {
						[key]: (store.res || {}).data || [],
						[loadingKey]: false
					};
				},
				created() {
					autoLoad && (this[loadKey])({ ...defaultParam, ...getParam(this) });
				},
				methods: {
					[loadKey](param, opts = {}) { // eslint-disable-line
						this[loadingKey] = true;
						let ajax = vuex ? this.request : this.$request;
						return ajax({
							url, // 必须是mutationType
							type: 'GET',
							localData: serviceCompare(param, store),
							loading: false,
							param,
							...opts
						}).then((res) => {
							res = {
								...res,
								data: parser ? parser(res.data) : res.data
							};
							store = {
								param,
								res
							};
							this[key] = store.res.data;
							cache && setItem(`${key}_${_global.version}`, store);
							return res;
						}).catch((res) => {
							this.$Message.error(res.msg);
							return Promise.reject(res);
						}).finally(() => {
							this[loadingKey] = false;
						});
					},
					[clearKey]() {
						store = { ...serviceObj };
					}
				}
			};
		}
	};
};

/**
 * 创建socket
 * @param {*} defaultOptions 
 */
export const createSocket = (defaultOptions = {}) => {
	const { 
		key, 
		url = URL_WEBSOCKET,
		bindUrl,
		param = {},
		getParam = (instance) => ({}),
		isNeedDestroy = true,
		parser
	} = defaultOptions;

	let socket;
	
	// clear
	serviceManager.add(() => {
		socket && socket.close();
		socket = undefined;
	});

	return {
		[key]: (userOptions = {}) => {
			return {
				data() {
					return {
						socket
					};
				},
				created() {
					this.socket = socket || this.initWebSocket();
				},
				methods: {
					initWebSocket() {
						socket = new Socket({ parser });
						socket.connect(objRegex.validURLScheme.regex.test(url) ? url : API_ROOT[url]);
						// 链接成功后获取client_id
						bindUrl && socket.on('connect', (res) => {
							const { data = {} } = res.data || {};
							this.$request({
								url: bindUrl,
								type: 'GET',
								param: {
									...data,
									...param,
									...getParam(this)
								},
							}).then((res) => { // eslint-disable-line
								// todo
							}).catch((error) => {
								this.$Message.error(error.msg);
							});
							// 绑定id，后端要求
						});
						socket.on('error', (res) => {
							this.$Message.error('服务器连接失败,请刷新页面');
						});

						// 存储
						return socket;
					}
				},
				beforeDestroy() {
					isNeedDestroy && socket && socket.close();
					isNeedDestroy && (socket = undefined);
				}
			};
		}
	};
};