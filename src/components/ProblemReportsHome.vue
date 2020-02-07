<template>
  <v-container>
    <v-layout row>
      <filter-tool-bar/>
    </v-layout>

    <v-layout v-if="trends && (trends.rising.length > 0 || trends.falling.length > 0)" row full-row-widget>
      <v-flex xs6 left-half-row-widget v-for="[key, title] in [['rising', 'Rising Trends'], ['falling', 'Falling Trends']]" :key="key">
        <topic-trend-report
            :title="title"
            :trends="trends[key].slice(0, 3)"
            @select="onClickTopic"
            :selected="selectedTopic"
        />
      </v-flex>
    </v-layout>

    <v-layout row v-if="topics.length > 0">
      <v-flex xs12>
        <v-card flat class="header">
          <v-card-title primary-title>
            <h1>Most Discussed Topics</h1>
          </v-card-title>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex v-for="(topic, index) in topics" :key="index" sm3>
                <v-card
                  color="white"
                  class="pointer"
                  hover
                  ripple
                  v-bind:class="{ 'toggle-effect': topic.checked }"
                  light
                  @click="loadTopicData(index)"
                >
                  <v-card-text>
                    <v-layout row wrap>
                      <v-flex xs12 sm6 pt-2>
                        <p class="anti-margin">{{topic.label}}</p>
                      </v-flex>
                      <v-flex xs12 sm6 pl-2>
                        <span>{{topic.tweetsNumber}}</span>
                        <v-icon class="spacing">person</v-icon>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <v-icon
                          v-if="topic.sentimentScore >= -1 && topic.sentimentScore <= 1"
                          class="spacing"
                        >thumbs_up_down</v-icon>
                        <v-icon v-if="topic.sentimentScore > 1" class="spacing">thumb_up</v-icon>
                        <v-icon v-if="topic.sentimentScore < -1" class="spacing">thumb_down</v-icon>
                      </v-flex>
                    </v-layout>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
    <v-card flat class="header">
      <v-card-title>
        <h1>{{ cardTableTitle }}</h1>
        <v-spacer/>
        <v-text-field
          v-model="searchQuery"
          append-icon="search"
          label="search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
    </v-card>
    <v-data-table
      :headers="tableHeaders"
      :items="visibleTweets"
      :search="searchQuery"
      :custom-sort="customTableSort"
      :pagination.sync="pagination"
    >
      <template slot="items" slot-scope="props">
        <tr>
          <td style="text-align:'center'">{{ getFormattedDate(props.item.created_at) }}</td>
          <td class="issue-title-value">{{ props.item.text }}</td>
          <td class="issue-action">
            <v-layout row v-if="(!props.item.is_annotated && props.item.classifier_certainty < 70)">
              <v-layout row v-if="props.item.label_status!=='wrong'">
                <v-layout>
                  <v-btn
                    small
                    outline
                    block
                    color="success"
                    class="action-left"
                    @click="labelTweetAs({
                      origin: tweetCategory,
                      index: props.index,
                      label: tweetCategory,
                      tweet: props.item
                  })"
                  >
                    <v-icon>done</v-icon>
                  </v-btn>
                  <v-btn
                    small
                    outline
                    block
                    color="error"
                    class="action-right"
                    @click="wrongLabel(props.index, props.item.status_id)"
                  >
                    <v-icon>clear</v-icon>
                  </v-btn>
                </v-layout>
              </v-layout>
              <v-layout row v-else>
                <v-layout>
                  <v-btn
                    small
                    outline
                    block
                    color="error"
                    class="action-left"
                    @click="labelTweetAs({
                      origin: tweetCategory,
                      index: props.index,
                      label: 'inquiry',
                      tweet: props.item
                  })"
                  >inquiry</v-btn>
                  <v-btn
                    small
                    outline
                    block
                    color="error"
                    class="action-left"
                    @click="labelTweetAs({
                      origin: tweetCategory,
                      index: props.index,
                      label: 'irrelevant',
                      tweet: props.item
                  })"
                  >irrelevant</v-btn>
                </v-layout>
              </v-layout>
            </v-layout>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";
import "moment/locale/de";
import {
  POST_TWEET_LABEL_ENDPOINT,
  POST_TWEET_LABEL_PAYLOAD,
  POST_TWEET_LABEL_BACKUP_ENDPOINT,
  POST_TWEET_LABEL_BACKUP_PAYLOAD
} from "./../RESTconf.js";
import {
  ACTION_SET_TOOLBAR_HEADER,
  ACTION_UPDATE_TWEET
} from "./../store/types.js";
import { FILTER_FOR_TOPIC, FILTER_FOR_CATEGORY } from "./../dataFilter.js";
import {GET_TOPIC_ENDPOINT, GET_TRENDING_TOPICS_ENDPOINT} from "../RESTconf";
import {conjoin} from "../util";

export default {
  name: "ProblemReportsHome",
  components: {
    "filter-tool-bar": () => import("./toolbar/FilterToolBar"),
    "topic-trend-report": () => import("./widget/topic/TopicTrendReport"),
  },
  data() {
    return {
      key: this.$route.path,
      tweetCategory: "problem_report",
      pagination: {
        sortBy: "created_at",
        descending: true
      },
      tableHeaders: [
        {
          text: "Date",
          align: "center",
          sortable: true,
          value: "created_at",
          width: "10%"
        },
        {
          text: "Tweet",
          align: "left",
          sortable: false,
          value: "text",
          width: "80%"
        },
        {
          text: "Label required",
          align: "center",
          sortable: true,
          value: "classifier_certainty",
          width: "10%"
        }
      ],
      erros: [],
      tooblarTitle: "Problem Reports",
      cardTableTitle: "Problem Reports",
      rawData: [],
      data: [],
      searchQuery: "",
      topics: [],
      topic: "",
      accountTrends: {},
      selectedTopic: null,
    };
  },
  computed: {
    visibleTweets: function () {
      const filters = [];

      if (this.selectedTopic !== null) {
        const ids = new Set(this.selectedTopic['member_ids']);
        filters.push(tweet => ids.has(tweet.status_id));
      }

      return this.data.filter(conjoin(...filters));
    },
    trends: function () {
      const ascending = (a, b) => a.score - b.score;
      const descending = (a, b) => b.score - a.score;

      const merged = (property, order) => this.$store.state.selectedTwitterAccounts
          .filter(accountName => this.accountTrends.hasOwnProperty(accountName))
          .flatMap(accountName => this.accountTrends[accountName][property].map(trend => ({...trend, accountName})))
          .sort(order);

      return {
        rising: merged('rising', descending),
        falling: merged('falling', ascending),
      };
    },
  },
  methods: {
    onClickTopic(topic) {
      if (this.selectedTopic && (this.selectedTopic.topic_id === topic.topic_id && this.selectedTopic.accountName === topic.accountName)) {
        this.selectedTopic = null;
      } else {
        axios
            .get(GET_TOPIC_ENDPOINT(topic.accountName, topic.topic_id))
            .then(response => this.selectedTopic = response.data)
            .catch(e => {
              this.errors.push(e);
            });
      }
    },
    loadData(tweets, topic) {
      //Sorted by creation date
      this.data = tweets.filter(FILTER_FOR_CATEGORY(this.tweetCategory));

      //Update Number for filtered tweets
      this.tweetsPerTopic(this.data);

      //Update Sentiment Score for filtered tweets
      this.sentimentScorePerTopic(this.data);

      if (topic != "") {
        this.data = this.data.filter(FILTER_FOR_TOPIC(this.topic));
      }

      this.data.sort((val1, val2) => {
        return val1.created_at - val2.created_at;
      });

      // Update UI
      this.data.splice(0, 0);
    },
    getFormattedDate(date) {
      return moment(date, "YYYYMMDD").format("DD.MM.YYYY");
    },
    labelTweetAs(labelObject) {
      let payload = {
        status_id: labelObject.tweet.status_id,
        label: labelObject.label,
        text: labelObject.tweet.text,
        date: parseInt(moment().format("YYYYMMDD")),
        previous_label: labelObject.tweet.tweet_class
      };
      axios
        .post(POST_TWEET_LABEL_ENDPOINT(), POST_TWEET_LABEL_PAYLOAD(payload))
        .then()
        .catch(e => {
          this.errors.push(e);
        });

      // send the label to the backupserver if configured.
      if (POST_TWEET_LABEL_BACKUP_ENDPOINT() != null) {
        axios
          .post(
            POST_TWEET_LABEL_BACKUP_ENDPOINT(),
            POST_TWEET_LABEL_BACKUP_PAYLOAD(payload)
          )
          .then()
          .catch(e => {
            this.errors.push(e);
          });
      }

      // remove the label option for the labeled tweet and update the UI
      labelObject.tweet.is_annotated = true;
      this.$store.dispatch(ACTION_UPDATE_TWEET, labelObject.tweet);

      // Update UI
      this.data.splice(0, 0);
    },
    wrongLabel(index, statusID) {
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].status_id === statusID) {
          this.data[i].label_status = "wrong";
          break;
        }
      }

      // Update UI
      this.data.splice(0, 0);
    },
    customTableSort(items, index, isDescending) {
      items.sort((a, b) => {
        if (index === "created_at") {
          if (isDescending) {
            return b.created_at - a.created_at;
          } else {
            return a.created_at - b.created_at;
          }
        } else if (index === "classifier_certainty") {
          if (isDescending) {
            return b.classifier_certainty - a.classifier_certainty;
          } else {
            return a.classifier_certainty - b.classifier_certainty;
          }
        }
      });

      return items;
    },
    loadTopicData(index) {
      //handles topic selection
      this.topics.forEach((topic, i) => {
        if (i == index) {
          topic.checked = !topic.checked;
          if (topic.checked) {
            this.topic = topic.label; // Only update the topic when it is checked
          } else {
            this.topic = "";
          }
        } else {
          topic.checked = false;
        }
      });
      this.loadData([...this.$store.getters.filteredTweets], this.topic);
    },
    tweetsPerTopic(tweets) {
      //Calculate number of tweets per topic
      this.topics.forEach(topic => {
        topic.tweetsNumber = tweets.filter(
                FILTER_FOR_TOPIC(topic.label)
        ).length;
      });
    },
    sentimentScorePerTopic(tweets) {
      // Calculate sentiment score per topic
      let filteredTweets = [];
      this.topics.forEach(topic => {
        filteredTweets = tweets.filter(FILTER_FOR_TOPIC(topic.label));
        let sentimentTotal = 0;
        filteredTweets.forEach(filteredTweet => {
          sentimentTotal += filteredTweet.sentiment_score;
        });
        topic.sentimentScore = sentimentTotal / filteredTweets.length;
      });
    },
    setupTopics() {
      // Fetch topics and push them as an object
      this.$store.state.accessKeyConfiguration.topics.forEach(topic => {
        this.topics.push({
          label: topic,
          checked: false,
          tweetsNumber: 0,
          sentimentScore: 0
        });
      });
    },
    fetchTrends() {
      this.$store.state.selectedTwitterAccounts.forEach(accountName => {
        axios
            .get(GET_TRENDING_TOPICS_ENDPOINT(accountName), {
              params: {
                start: '2019-12-02',
                end: '2019-12-09',
              }
            })
            .then(response => this.$set(this.accountTrends, accountName, response.data))
            .catch(e => {
              this.errors.push(e);
            });
      });
    },
  },
  mounted() {
    this.setupTopics();
    this.fetchTrends();
    this.$store.watch(
      (state, getters) => getters.filteredTweets,
      (newValue, oldValue) => {
        this.loadData([...newValue], this.topic);
      },
    );
    this.$store.dispatch(ACTION_SET_TOOLBAR_HEADER, this.tooblarTitle);
  },
};
</script>

<style scoped>
.header {
  margin-top: 20px;
}
.card-title-text {
  font-size: 2em;
  text-align: center;
}
table.v-table tbody tr,
table.v-table tbody td,
table.v-table tbody th {
  min-height: 50px;
  height: 50px;
  max-height: 50px;
}
.row-item {
  margin: 15px 10px 15px 10px;
}
.row-header {
  margin: 15px 10px 35px 10px;
  position: "fixed";
}
.action-left {
  margin-right: 5px;
}
.action-right {
  margin-left: 5px;
}
h1 {
  text-align: center;
}
.list-enter,
.list-leave-to {
  transition: all 0.5s;
  opacity: 0;
}
.backgroundcolor-red {
  background-color: rgba(255, 0, 0, 0.04);
}
.backgroundcolor-yellow {
  background-color: rgba(255, 249, 196, 0.5);
}
.backgroundcolor-grey {
  background-color: rgba(238, 238, 238, 0.04);
}
.spacing {
  padding-top: 0px;
}
.pointer {
  cursor: pointer;
}
.toggle-effect {
  background-color: #bdbdbd !important;
}
.anti-margin {
  margin-bottom: 0px !important;
}
</style>
