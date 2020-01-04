import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  getServerFromStorage,
  saveServerToStorage,
  getMappingsFromStorage,
  saveMappingsToStorage,
} from './utils';

const StoreProvider = ({ children: contentRenderer, ...props }) => {
  const [server, setServer] = useState({});
  const [mappings, setMappings] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const initServer = await getServerFromStorage();
      const initMappings = await getMappingsFromStorage();

      setServer(initServer);
      setMappings(initMappings);
      setLoaded(true);
    })();
  }, []);

  return loaded
    ? contentRenderer({
        server,
        mappings,
        onServerUpdate: (newServer) => {
          setServer(newServer);
          saveServerToStorage(newServer);
        },
        onMappingsUpdate: (newMappings) => {
          setMappings(newMappings);
          saveMappingsToStorage(newMappings);
        },
      })
    : null;
};

StoreProvider.propTypes = {
  children: PropTypes.func.isRequired,
};

export default StoreProvider;
