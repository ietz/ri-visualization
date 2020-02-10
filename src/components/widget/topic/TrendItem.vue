import {format} from "date-fns";
<template>
	<div @click="(ev) => !editing && $emit('click', ev)" :class="{'trend-item': true, 'selected': selected}">
		<v-card-text>
			<textarea
				ref="nameInput"
				v-model="name"
				placeholder="Topic name"
				:disabled="!editing"
				style="width: 100%"
				rows="1"
				@blur="onBlurTextarea" />
		</v-card-text>

		<v-layout align-center justify-end>
			<v-icon v-if="selected" class="mr-4" small @click.stop="startEdit">edit</v-icon>

			<span class="subheading mr-2">{{trend.occurrences.current}}</span>
			<span :class="textClass">{{changeText}}</span>

			<v-icon v-if="isPositive" color="green" class="mr-4">arrow_drop_up</v-icon>
			<v-icon v-else color="red" class="mr-4">arrow_drop_down</v-icon>
		</v-layout>
	</div>
</template>

<script>
	import autosize from 'autosize';
	import axios from "axios";
	import {PATCH_TOPIC_ENDPOINT} from "../../../RESTconf";

	export default {
		name: "TrendItem",
		props: ['trend', 'selected'],
		data: () => ({
			editing: false,
			name: '',
		}),
		computed: {
			change: function () {
				const {occurrences: {before, current}} = this.trend;
				return current - before;
			},
			changeText: function () {
				const {occurrences: {before}} = this.trend;
				const changeStr = this.isPositive ? `+${this.change}` : `${this.change}`;
				const changePct = this.change / before;
				const changePctStr = changePct <= 500
						? Math.abs(Math.round(100*changePct)).toString()
						: '>500';

				return `${changeStr} (${changePctStr}%)`
			},
			isPositive: function () {
				return this.change >= 0;
			},
			textClass: function () {
				return this.isPositive ? 'green--text' : 'red--text';
			},
		},
		watch: {
			selected: function () {
				if (!this.selected) {
					this.editing = false;
				}
			},
			trend: function () {
				const newText = this.trend.name || this.trend.representative.text;
				if (newText !== this.name) {
					this.name = newText;
				}
			}
		},
		methods: {
			startEdit() {
				this.editing = true;
				setTimeout(() => this.$refs.nameInput.focus(), 0);
			},
			onBlurTextarea() {
				this.editing = false;
				axios
					.patch(PATCH_TOPIC_ENDPOINT(this.trend.accountName, this.trend.topic_id), {
						'name': this.name,
					})
					.catch(e => {
						this.errors.push(e);
					});
			},
		},
		mounted() {
			this.name = this.trend.name || this.trend.representative.text;
			autosize(this.$refs.nameInput)
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
