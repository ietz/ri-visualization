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
