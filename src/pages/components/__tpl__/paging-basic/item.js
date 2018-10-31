export default {
	data() {
		return {
			columns: [
				{
					title: 'Title',
					key: 'title'
				},
				{
					title: 'Status',
					key: 'status',
					render: (h, params) => {
						return h('div', {
							style: {
								marginRight: '5px'
							},
							on: {
								click: this.handleResetFirst
							}
						}, '回到首页刷新');
					}
				},
				{
					title: 'Opt',
					key: 'opt',
					render: (h, params) => {
						return h('div', {
							style: {
								marginRight: '5px'
							},
							on: {
								click: this.handleResetCur
							}
						}, '当前页刷新');
					}
				},
				{
					title: 'Link',
					key: 'link',
					render: (h, params) => {
						return h('div', {
							style: {
								marginRight: '5px'
							},
							on: {
								click: this.handleLinkTo
							}
						}, '跳转到paging-tabs');
					}
				}
			],
		};
	},
	methods: {
		handleResetFirst() {
			this.$store.commit('TPL_PAGING_BASIC_LIST_INIT');
		},
		handleResetCur() {
			this.$store.commit('TPL_PAGING_BASIC_LIST_RESET');
		},
		handleLinkTo() {
			this.$router.push('/tpl/paging/tabs');
		},
	}
};
