<template>
    <v-card flat class="header">
        <v-card-title>
            <h1>Configure Topics of Interest</h1>
        </v-card-title>

        <v-card-text>
            <v-select
                    v-model="accountName"
                    required
                    :items="this.$store.state.twitterAccounts"
                    menu-props="auto"
                    label="Account"
                    hide-details
                    single-line
                    class="selector-lang" />

            <v-list v-if="accountTopics.hasOwnProperty(accountName)">
                <TopicOfInterestTile
                        v-for="topic in accountTopics[accountName]"
                        :key="topic.topic_id"
                        :topic="topic" />
            </v-list>
        </v-card-text>
    </v-card>
</template>

<script>
  import {GET_FREQUENT_TOPICS_ENDPOINT} from "../../../RESTconf";
  import axios from "axios";
  import TopicOfInterestTile from "./TopicOfInterestTile";

  export default {
    name: "TopicsOfInterest",
    components: {TopicOfInterestTile},
    data: () => ({
      accountName: '',
      accountTopics: {},
    }),
    mounted() {
      this.$store.state.twitterAccounts.forEach((accountName) => {
        axios
          .get(GET_FREQUENT_TOPICS_ENDPOINT(accountName))
          .then(response => this.$set(this.accountTopics, accountName, response.data.map(topic => ({...topic, accountName}))));
        }
      );
    },
  }
</script>

<style scoped>

</style>
