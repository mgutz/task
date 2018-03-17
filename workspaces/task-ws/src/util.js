const rawPrefix = '$(R!]';
const prefixLength = rawPrefix.length;

const serializeRaw = (event, body) => {
  return rawPrefix + event + ',' + body;
};

// returns [event, payload]
const deserializeRaw = msg => {
  const comma = msg.indexOf(',');
  const event = msg.slice(prefixLength, comma - prefixLength);
  return [event, msg.slice(comma + 1)];
};

const isRawMessage = msg => {
  return msg.startsWith(rawPrefix);
};

module.exports = {deserializeRaw, serializeRaw, isRawMessage};
