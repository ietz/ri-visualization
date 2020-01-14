<template>
	<v-card>
		<v-card-title primary-title class="headline mb-1">{{title}}</v-card-title>

		<div v-for="trend in trends">
			<v-divider horizontal/>
			<TrendItem :trend="trend" />
		</div>
	</v-card>
</template>

<script>
	import TrendItem from "./TrendItem";
	export default {
		name: "TopicTrendReport",
		components: {TrendItem},
		props: ['title', 'trends'],
	};
</script>

<style scoped>

</style>
