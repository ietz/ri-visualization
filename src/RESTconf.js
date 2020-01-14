/* eslint-disable */
export const BASE_URL = process.env.VUE_APP_BASE_URL;
export const BACKUP_URL = process.env.VUE_APP_BACKUP_URL;
const axios = require('axios');
axios.defaults.headers.common = {
  'Authorization': 'Bearer ' + process.env.VUE_APP_BEARER_TOKEN
};
export default axios;

export const GET_ALL_TWEETS_ENDPOINT = function (twitterAccount) {
  return `${BASE_URL}/ri-storage-twitter/account_name/${twitterAccount}/all`;
};
export const GET_TWITTER_ACCOUNT_EXISTS_ENDPOINT = function (twitterAccount) {
  return `${BASE_URL}/ri-collection-explicit-feedback-twitter/${twitterAccount}/exists`;
};
export const GET_TWITTER_OBSERVABLES_ENDPOINT = function (twitterAccount) {
  return `${BASE_URL}/ri-storage-twitter/observables`;
};
export const POST_TWITTER_OBSERVABLE_ENDPOINT = function (accountName, interval, lang) {
  return `${BASE_URL}/ri-orchestration-twitter/hitec/orchestration/twitter/observe/tweet/account/${accountName}/interval/${interval}/lang/${lang}`;
};
export const DELETE_TWITTER_OBSERVABLE_ENDPOINT = function (accountName) {
  return `${BASE_URL}/ri-orchestration-twitter/hitec/orchestration/twitter/observe/account/${accountName}`;
};
export const POST_TWEET_LABEL_ENDPOINT = function () {
  return `${BASE_URL}/ri-storage-twitter/label/tweet/`;
};
export const POST_TWEET_LABEL_PAYLOAD = function (data) {
  let payload = {
    status_id: data.status_id,
    label: data.label,
    date: data.date,
    previous_label: data.previous_label
  };
  return JSON.stringify(payload);
};
export const POST_UPDATE_ACCESS_KEY_CONFIGURATION_ENDPOINT = function () {
  return `${BASE_URL}/ri-storage-twitter/access_key/update`;
};
export const POST_UPDATE_ACCESS_KEY_CONFIGURATION_PAYLOAD = function (accessKey, accessKeyConfiguration) {
  let payload = {
    access_key: accessKey,
    configuration: accessKeyConfiguration
  };
  return JSON.stringify(payload);
};
export const POST_TWEET_LABEL_BACKUP_ENDPOINT = function () {
  if (BACKUP_URL) {
    return `${BACKUP_URL}/windtretrial/labeledtweet`;
  } else {
    return null;
  }
};
export const POST_TWEET_LABEL_BACKUP_PAYLOAD = function (data) {
  let payload = {
    status_id: data.status_id,
    label: data.label,
    text: data.text,
    date: data.date,
    previous_label: data.previous_label
  };
  return JSON.stringify(payload);
};
export const POST_RETRIEVE_ACCESS_KEY_CONFIGURATION = function (accessKey) {
  return `${BASE_URL}/ri-storage-twitter/access_key/configuration`;
};
export const POST_RETRIEVE_ACCESS_KEY_CONFIGURATION_PAYLOAD = function (accessKey) {
  let payload = {
    access_key: accessKey,
  };
  return JSON.stringify(payload);
};
export const GET_TRENDING_TOPICS_ENDPOINT = function (twitterAccount) {
  return `${BASE_URL}/ri-topics/${twitterAccount}/trends`;
};
