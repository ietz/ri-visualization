<template>
  <v-toolbar :color="color" height="75">
    <v-layout row wrap>
      <v-flex xs5 v-if="showAccountFilter()">
        <v-select
          :menu-props="{maxWidth:'300'}"
          v-model="selectedTwitterAccounts"
          :items="twitterAccounts"
          label="Twitter Accounts"
          multiple
        >
          <template v-slot:prepend-item>
            <v-list-tile ripple @click="toggleTwitterAccounts">
              <v-list-tile-action>
                <v-icon
                  :color="selectedTwitterAccounts.length > 0 ? 'indigo darken-4' : ''"
                >{{ iconTwitterAccounts }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Select All</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider class="mt-2"></v-divider>
          </template>
          <template v-slot:selection="{ item, index }">
            <v-chip v-if="index <= 2" small color="black" outline>
              <span>{{ item }}</span>
            </v-chip>
            <span
              v-if="index === 3"
              class="black--text caption"
            >(+{{ selectedTwitterAccounts.length - 3 }} others)</span>
          </template>
        </v-select>
      </v-flex>

      <v-flex xs5 offset-xs1 v-if="showTopicFilter()">
        <v-select
          :menu-props="{maxWidth:'300'}"
          v-model="selectedTopics"
          :items="topics"
          label="Topics"
          multiple
        >
          <template v-slot:prepend-item>
            <v-list-tile ripple @click="toggleTopics">
              <v-list-tile-action>
                <v-icon :color="selectedTopics.length > 0 ? 'indigo darken-4' : ''">{{ iconTopics }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Select All</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider class="mt-2"></v-divider>
          </template>
          <template v-slot:selection="{ item, index }">
            <v-chip v-if="index <= 2" small color="black" outline>
              <span>{{ item }}</span>
            </v-chip>
            <span
              v-if="index === 3"
              class="black--text caption"
            >(+{{ selectedTopics.length - 3 }} others)</span>
          </template>
        </v-select>
      </v-flex>

      <v-flex xs3 offset-xs1 v-if="showDateFilter()">
        <v-menu
          :close-on-content-click="false"
          v-model="modelFromDateMenu"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            class="date-text"
            slot="activator"
            v-model="modelFromDateText"
            value="modelFromDateText"
            label="From:"
            persistent-hint
            prepend-icon="event"
            readonly
            clearable
            @input="clearDateFrom"
          ></v-text-field>
          <v-date-picker
            v-model="dateFrom"
            no-title
            @input="modelFromDateMenu = false"
            @change="filterTweets"
          ></v-date-picker>
        </v-menu>
      </v-flex>

      <v-flex xs3 v-if="showDateFilter()">
        <v-menu
          :close-on-content-click="false"
          v-model="modelToDateMenu"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="modelToDateText"
            label="To:"
            persistent-hint
            prepend-icon="event"
            readonly
            clearable
            @input="clearDateTo"
          ></v-text-field>
          <v-date-picker
            v-model="dateTo"
            no-title
            @input="modelToDateMenu = false"
            @change="filterTweets"
          ></v-date-picker>
        </v-menu>
      </v-flex>
      <v-spacer></v-spacer>
    </v-layout>
  </v-toolbar>
</template>

<script>
import VContent from "vuetify/lib/components/VGrid/VContent";
import TopToolBar from "./TopToolBar";
import {
  ACTION_FILTER_TWEETS,
  MUTATE_SELECTED_TOPICS,
  MUTATE_SELECTED_TWITTER_ACCOUNTS,
  MUTATE_SELECTED_DATE_RANGE,
} from "./../../store/types";
import { BLUE_FILL } from "../../colors.js";
import moment from "moment";
import "moment/locale/de";
import {
  ROUTE_DASHBOARD,
  ROUTE_PROBLEM_REPORTS,
  ROUTE_INQUIRIES,
  ROUTE_COMPARISON
} from "../../routes.js";

export default {
  name: "FilterToolBar",
  components: {
    TopToolBar,
    VContent
  },
  data() {
    return {
      modelFromDateMenu: false,
      modelToDateMenu: false,
      twitterAccounts: [],
      topics: this.$store.getters.accessKeyConfigurationTopics,
      selectedTwitterAccounts: [],
      selectedTopics: [],
      dateFrom: null,
      dateTo: null,
      color: BLUE_FILL,
      path: this.$router.currentRoute.path
    };
  },
  methods: {
    showAccountFilter() {
      return (
        this.path === ROUTE_DASHBOARD ||
        this.path === ROUTE_PROBLEM_REPORTS ||
        this.path === ROUTE_INQUIRIES ||
        this.path === ROUTE_COMPARISON
      );
    },
    showDateFilter() {
      return (
        this.path === ROUTE_PROBLEM_REPORTS || this.path === ROUTE_INQUIRIES
      );
    },
    showTopicFilter() {
      return this.path === ROUTE_COMPARISON;
    },
    clearDateFrom() {
      this.dateFrom = null;
      this.filterTweets();
    },
    clearDateTo() {
      this.dateTo = null;
      this.filterTweets();
    },
    formatDate(date) {
      return moment(date, "YYYY-MM-DD").format("DD.MM.YYYY");
    },
    filterTweets() {
      let payload = {
        twitterAccounts: this.selectedTwitterAccounts,
        fromDate: this.dateFrom ? this.dateFrom.toString() : null,
        toDate: this.dateTo ? this.dateTo.toString() : null
      };
      this.$store.dispatch(ACTION_FILTER_TWEETS, payload);
    },
    loadAccountNames() {
      let storeTwitterAccounts = this.$store.getters
        .accessKeyConfigurationTwitterAccounts;
      storeTwitterAccounts.forEach(twitterAccount => {
        if (twitterAccount in this.$store.getters.tweets) {
          this.twitterAccounts.push(twitterAccount);
        }
      });
    },
    toggleTwitterAccounts() {
      this.$nextTick(() => {
        if (this.selectedAllTwitterAccounts) {
          this.selectedTwitterAccounts = [];
        } else {
          this.selectedTwitterAccounts = this.twitterAccounts.slice();
        }
      });
    },
    toggleTopics() {
      this.$nextTick(() => {
        if (this.selectedAllTopics) {
          this.selectedTopics = [];
        } else {
          this.selectedTopics = this.topics.slice();
        }
      });
    },
    updateDateRange() {
      this.$store.commit(
        MUTATE_SELECTED_DATE_RANGE,
        {from: this.dateFrom, to: this.dateTo}
      );
    }
  },
  computed: {
    selectedAllTwitterAccounts() {
      return (
        this.selectedTwitterAccounts.length === this.twitterAccounts.length
      );
    },
    selectedSomeTwitterAccounts() {
      return (
        this.selectedTwitterAccounts.length > 0 &&
        !this.selectedAllTwitterAccounts
      );
    },
    iconTwitterAccounts() {
      if (this.selectedAllTwitterAccounts) {
        return "check_box";
      }
      if (this.selectedSomeTwitterAccounts) {
        return "indeterminate_check_box";
      }
      return "check_box_outline_blank";
    },
    selectedAllTopics() {
      return this.selectedTopics.length === this.topics.length;
    },
    selectedSomeTopics() {
      return this.selectedTopics.length > 0 && !this.selectedAllTopics;
    },
    iconTopics() {
      if (this.selectedAllTopics) {
        return "check_box";
      }
      if (this.selectedSomeTopics) {
        return "indeterminate_check_box";
      }
      return "check_box_outline_blank";
    },
    modelFromDateText: {
      get: function() {
        return this.dateFrom ? this.formatDate(this.dateFrom) : "";
      },
      set: function(val) {
        return (this.dateFrom = val);
      }
    },
    modelToDateText: {
      get: function() {
        return this.dateTo ? this.formatDate(this.dateTo) : "";
      },
      set: function(val) {
        return (this.dateTo = val);
      }
    }
  },
  mounted() {
    this.loadAccountNames();
    this.selectedTwitterAccounts = this.twitterAccounts;
    this.filterTweets();
  },
  watch: {
    selectedTwitterAccounts() {
      this.filterTweets();
      this.$store.commit(
        MUTATE_SELECTED_TWITTER_ACCOUNTS,
        this.selectedTwitterAccounts
      );
    },
    dateFrom() {
      this.updateDateRange();
    },
    dateTo() {
      this.updateDateRange();
    },
    selectedTopics() {
      this.$store.commit(MUTATE_SELECTED_TOPICS, this.selectedTopics);
    }
  }
};
</script>

<style lang="scss" scoped>
.daterange-picker {
  .calendar-holder {
    position: absolute;
  }
}

.account-select {
  max-width: 33%;
  min-width: 33%;
}

.text-size {
  font-size: 1.4em;
}
</style>
