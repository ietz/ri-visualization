<template>
    <v-list-tile @click="" class="topic-interest-tile">
        <v-list-tile-action>
            <v-checkbox v-model="value" />
        </v-list-tile-action>

        <v-list-tile-content @click="value = !value">
            {{topic.name || topic.representative.text}}
        </v-list-tile-content>
    </v-list-tile>
</template>

<script>
  import {MUTATE_TOPIC_INTEREST} from "../../../store/types";

  export default {
    name: "TopicOfInterestTile",
    props: ['topic'],
    computed: {
      value: {
        get: function () {
          return this.$store.getters.isTopicOfInterest(this.topic.accountName, this.topic.topic_id);
        },
        set: function (value) {
          return this.$store.commit(
            MUTATE_TOPIC_INTEREST,
            {
              accountName: this.topic.accountName,
              topicId: this.topic.topic_id,
              value,
            }
          );
        },
      },
    },
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
