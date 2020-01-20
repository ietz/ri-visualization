export const FILTER_FOR_TOPIC = topic => tweet => {
  let firstTopic = tweet.topics.first_class;
  let secondTopic = tweet.topics.second_class;
  return ((firstTopic.label == topic && firstTopic.score > 0.7) || (secondTopic.label == topic && secondTopic.score > 0.7));
};
export const FILTER_FOR_CATEGORY = category => tweet => {
  return tweet.tweet_class == category;
};
export const FILTER_NEUTRAL_SENTIMENT = tweet => {
  return tweet.sentiment_score > 1 || tweet.sentiment_score < -1;
};
export const FILTER_TIMEFRAME = (startDate, endDate) => tweet => {
  return tweet.created_at >= startDate && tweet.created_at <= endDate;
};
