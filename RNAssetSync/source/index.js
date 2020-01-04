import React from 'react';
import PropTypes from 'prop-types';
import {
  DimensionScrollScreen,
  DimensionScreen,
  Screen,
} from '@actualwave/react-native-kingnare-style';

import StoreProvider from './StoreProvider';
import ServerAddress from './ServerAddress';
import AssetDownloader from './AssetDownloader';

const AppScreen = (props) => (
  <Screen style={{ padding: 10, alignItems: 'stretch' }}>
    <StoreProvider>
      {({ server, mappings, onServerUpdate, onMappingsUpdate }) => {
        return (
          <>
            <ServerAddress {...server} onUpdate={onServerUpdate} />
            <AssetDownloader
              server={server}
              mappings={mappings}
              onServerUpdate={onServerUpdate}
              onMappingsUpdate={onMappingsUpdate}
            />
          </>
        );
      }}
    </StoreProvider>
  </Screen>
);

export default AppScreen;
