import {withDefault} from "../util";
import moment from "moment";

export const getTopBarTitle = state => {
  return state.topBarTitle;
};
export const tweets = state => {
  return state.tweets;
};
export const loggedIn = state => {
  return state.loggedIn;
};
export const accessKeyConfigurationTwitterAccounts = state => {
  return state.accessKeyConfiguration.twitter_accounts;
};
export const accessKeyConfigurationTopics = state => {
  return state.accessKeyConfiguration.topics;
};
export const accessKeyConfiguration = state => {
  return state.accessKeyConfiguration;
};
export const accessKey = state => {
  return state.accessKey;
};
export const filteredTweets = state => {
  return state.filteredTweets;
};
export const customFilteredTweets = state => filterOverrides => {
  const twitterAccounts = withDefault(filterOverrides.twitterAccounts, state.selectedTwitterAccounts);
  const fromDate = withDefault(filterOverrides.fromDate, state.selectedDateRange.from);
  const toDate = withDefault(filterOverrides.toDate, state.selectedDateRange.to);

  let tmpFilteredTweets = [];

  twitterAccounts.forEach(account => {
    tmpFilteredTweets = tmpFilteredTweets.concat(state.tweets[account]);
  });

  // check if the user filters for a time-frame => if yes, filter
  if (fromDate) {
    let dateFromCompare = moment(fromDate, 'YYYY-MM-DD').format('YYYYMMDD');
    tmpFilteredTweets = tmpFilteredTweets.filter(tweet => tweet.created_at >= dateFromCompare);
  }
  if (toDate) {
    let dateToCompare = moment(toDate, 'YYYY-MM-DD').format('YYYYMMDD');
    tmpFilteredTweets = tmpFilteredTweets.filter(tweet => tweet.created_at <= dateToCompare);
  }

  return tmpFilteredTweets;
};
export const selectedTopics = state => {
  return state.selectedTopics;
};
export const dataUpToDate = state => {
  return state.dataUpToDate;
};
export const isTopicOfInterest = state => (accountName, topicId) => {
  const interests = state.topicsOfInterest[accountName];

  return (
    !interests || // no account specific settings
    !(topicId in interests) || // topic not explicitly ignored
    interests[topicId]
  );
};
