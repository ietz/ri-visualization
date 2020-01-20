<template>
	<div @click="$emit('click')" :class="{'trend-item': true, 'selected': selected}">
		<v-card-text>
			{{trend.representative.text}}
		</v-card-text>

		<v-layout align-center justify-end>
			<span class="subheading mr-2">{{trend.occurrences.current}}</span>
			<span :class="textClass">{{changeText}}</span>
			<v-icon color="green" class="mr-4">arrow_drop_up</v-icon>
		</v-layout>
	</div>
</template>

<script>
	export default {
		name: "TrendItem",
		props: ['trend', 'selected'],
		computed: {
			change: function () {
				const {occurrences: {before, current}} = this.trend;
				return current - before;
			},
			changeText: function () {
				const {occurrences: {current}} = this.trend;
				const changeStr = this.isPositive ? `+${this.change}` : `${this.change}`;
				const changePct = this.change / current;
				const changePctStr = Math.abs(Math.round(100*changePct)).toString();

				return `${changeStr} (${changePctStr}%)`
			},
			isPositive: function () {
				return this.change >= 0;
			},
			textClass: function () {
				return this.isPositive ? 'green--text' : 'red--text';
			},
		}
	}
</script>

<style scoped>
	.trend-item {
		cursor: pointer;
	}
	.trend-item.selected {
		background-color: #def7f6;
	}
</style>
