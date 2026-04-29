const React = require('react');
const { Text } = require('react-native');

const createMockIcon = (name) => {
  const Icon = (props) => React.createElement(Text, { testID: props.testID }, props.name || name);
  Icon.displayName = name;
  return Icon;
};

module.exports = new Proxy(
  {},
  {
    get: (_, prop) => createMockIcon(prop),
  },
);
