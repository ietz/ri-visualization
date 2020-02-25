import axios from 'axios';
import "moment/locale/de";
import {
  GET_ALL_TWEETS_ENDPOINT,
  GET_TOPICS_ENDPOINT,
  PATCH_TOPIC_ENDPOINT,
} from './../RESTconf';
import {
  ACTION_RESET_FILTERED_TWEETS,
  MUTATE_FILTERED_TWEETS,
  MUTATE_TOOLBAR_HEADER,
  MUTATE_TOPIC,
} from './../store/types';
import {customFilteredTweets} from './getters';
import Vue from 'vue';
import {keyBy} from "lodash";

export const actionFetchInitialData = ({
  state,
  commit
}, twitterAccounts) => {
  const tweetRequests = twitterAccounts.flatMap(twitterAccount => (
    axios
      .get(GET_ALL_TWEETS_ENDPOINT(twitterAccount))
      .then(response => {
        if (response.data !== null) {
          let payload = {[twitterAccount]: response.data};
          state.tweets = Object.assign({}, state.tweets, payload);
        }
      })
  ));

  const topicRequests = twitterAccounts.flatMap(twitterAccount => (
    axios
      .get(GET_TOPICS_ENDPOINT(twitterAccount))
      .then(response => {
        const topics = response.data.map(topic => ({...topic, accountName: twitterAccount}));
        Vue.set(state.topics, twitterAccount, keyBy(topics, 'topic_id'));
      })
  ));

  return Promise.all([...tweetRequests, ...topicRequests]).then(() => {state.initialDataLoaded = true;});
};
export const actionFilterTweets = ({
  state,
  dispatch,
  commit
}, payload) => {
  state.dataUpToDate = false;
  state.dataUpdating = true;

  dispatch(ACTION_RESET_FILTERED_TWEETS);

  state.dataUpdating = false;
  commit(MUTATE_FILTERED_TWEETS, customFilteredTweets(state)(payload));
  state.dataUpToDate = true;
};
export const actionResetFilteredTweets = ({
  state,
  commit
}) => {
  let tmpFilteredTweets = [];
  Object.keys(state.tweets).forEach(function (account) {
    tmpFilteredTweets = tmpFilteredTweets.concat(state.tweets[account]);
  });
  commit(MUTATE_FILTERED_TWEETS, tmpFilteredTweets);
};
export const actionUpdateTweet = ({
  state
}, tweet) => {
  // update the original data source (tweets)
  Object.keys(state.tweets).forEach(function (account) {
    for (let i = 0; i < state.tweets[account].length; i++) {
      if (state.tweets[account][i].status_id === tweet.status_id) {
        state.tweets[account][i] = tweet;
      }
    }
  });

  // update filtered tweet lis
  for (let i = 0; i < state.filteredTweets.length; i++) {
    if (state.filteredTweets[i].status_id === tweet.status_id) {
      state.filteredTweets[i] = tweet;
    }
  }

  // notify listener
  state.dataUpToDate = true;
};
export const actionRemoveUnlabeledTweet = ({
  state
}, statusID) => {
  for (let i = 0; i < state.unlabeledTweets.length; i++) {
    if (state.unlabeledTweets[i].status_id === statusID) {
      state.unlabeledTweets.splice(i, 1);
    }
  }
};
export const setToolbarHeader = ({
  commit
}, title) => {
  commit(MUTATE_TOOLBAR_HEADER, title);
};
export const patchTopic = ({state, commit}, {accountName, topicId, patch}) => {
  const previousTopicState = {...state.topics[accountName][topicId]};
  commit(MUTATE_TOPIC, {accountName, topicId, patch});

  axios.patch(PATCH_TOPIC_ENDPOINT(accountName, topicId), patch)
    .catch(() => commit(MUTATE_TOPIC, {accountName, topicId, patch: previousTopicState}));
};
