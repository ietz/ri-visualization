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

            <v-list v-if="accountData.hasOwnProperty(accountName)">
                <v-list-tile @click="" v-for="data in accountData[accountName]" :key="data.topic.topic_id" class="topic-interest-tile">
                    <v-list-tile-action>
                        <v-checkbox v-model="data.interest" />
                    </v-list-tile-action>

                    <v-list-tile-content @click="data.interest = !data.interest">
                        {{data.topic.name || data.topic.representative.text}}
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-card-text>
    </v-card>
</template>

<script>
  import {GET_FREQUENT_TOPICS_ENDPOINT} from "../../../RESTconf";
  import axios from "axios";

  export default {
    name: "TopicsOfInterest",
    data: () => ({
      accountName: '',
      accountData: {},
    }),
    mounted() {
      this.$store.state.twitterAccounts.forEach((accountName) => {
        axios
          .get(GET_FREQUENT_TOPICS_ENDPOINT(accountName))
          .then(response => {
            const accountData = response.data.reduce((acc, topic) =>
              ({...acc, [topic.topic_id]: {topic, interest: true}}),
              {},
            );
            this.$set(this.accountData, accountName, accountData);
          })
        }
      )
    }
  }
</script>

<style>
    .topic-interest-tile .v-list__tile {
        height: auto;
    }

    .topic-interest-tile .v-list__tile__content {
        height: auto;

        padding-top: 16px;
        padding-bottom: 16px;
    }
</style>
