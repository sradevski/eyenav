
exports.messageToRawData = function (message) {
  return JSON.stringify(message) + '\n';
};

/**
 * @function rawDataToMessages
 * @param {string} rawData
 * @return {message[]} Array of message objects.
 * @throws on malformed JSON
 */
exports.rawDataToMessages = function (rawData) {
  // Is is possible that data includes two or more json objects,
  // apparently separated by a newline.

  // Split newlines OS independent way.
  // See http://stackoverflow.com/a/21895354/638546
  var jsons, json, message, messages;
  messages = [];

  jsons = rawData.split(/\r?\n/);

  while (jsons.length !== 0) {
    json = jsons.shift();

    if (json.length < 1) {
      // There has been empty newline in the end of rawdata
      continue;
    }

    try {
      message = JSON.parse(json);
    } catch (e) {
      throw e;
    }

    messages.push(message);
  }

  return messages;
};
