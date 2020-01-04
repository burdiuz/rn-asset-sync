import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  TextButton,
  TextInput,
  Header,
  VGroup,
  HGroup,
  RGroup,
} from '@actualwave/react-native-kingnare-style';

const ServerAddress = ({
  address: initAddress = '',
  port: initPort = '',
  onUpdate,
}) => {
  const [address, setAddress] = useState(initAddress);
  const [port, setPort] = useState(initPort);
  const [pristine, setPristine] = useState(true);

  return (
    <VGroup noHorizontalPadding>
      <Header>Asset Server Address</Header>
      <HGroup noHorizontalPadding>
        <TextInput
          value={address}
          placeholder="Server Address"
          style={{ flex: 0.85, marginRight: 10 }}
          onChangeText={(text) => {
            setAddress(text);
            setPristine(false);
          }}
        />
        <TextInput
          value={port}
          placeholder="Port"
          style={{ flex: 0.15, flexBasis: 40 }}
          onChangeText={(text) => {
            setPort(text);
            setPristine(false);
          }}
        />
      </HGroup>
      <RGroup noPadding>
        <TextButton
          label="Reset"
          onPress={() => {
            setAddress(initAddress);
            setPort(initPort);
            setPristine(true);
          }}
          disabled={pristine}
          style={{ marginRight: 10 }}
        />
        <TextButton
          label="Apply"
          onPress={() => {
            onUpdate({
              address,
              port,
            });

            setPristine(true);
          }}
          disabled={pristine}
        />
      </RGroup>
    </VGroup>
  );
};

export default ServerAddress;
