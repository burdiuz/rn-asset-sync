import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  Small,
  LinkButton,
  SmallHeaderText,
  VGroup,
  HGroup,
  RGroup,
  SBGroup,
  HRule,
} from '@actualwave/react-native-kingnare-style';
import DirectoryPickerManager from 'react-native-directory-picker';

import { requestPermission, replaceMapping, fetchContainers } from './utils';

const ContainerListItem = ({
  container,
  onUpdate,
  onCopyAll,
  onSynchronize,
}) => {
  const { name, targetPath } = container;

  return (
    <VGroup>
      <SBGroup noPadding>
        <SmallHeaderText style={{ textAlign: 'left' }}>{name}</SmallHeaderText>
        <HGroup noPadding>
          {targetPath ? (
            <>
              <LinkButton
                label="Copy All"
                labelStyle={{ fontSize: 12, marginRight: 10 }}
                onPress={() => onCopyAll([container])}
              />
              <LinkButton
                label="Synchronize"
                labelStyle={{ fontSize: 12 }}
                onPress={() => onSynchronize([container])}
              />
            </>
          ) : null}
        </HGroup>
      </SBGroup>
      <HRule />
      <Small>{targetPath || '< Target Path Not Set >'}</Small>

      <RGroup noPadding>
        {targetPath ? (
          <LinkButton
            label="Reset Path"
            labelStyle={{ fontSize: 12, marginRight: 10 }}
            onPress={() =>
              onUpdate({
                ...container,
                targetPath: '',
                syncedAt: 0,
              })
            }
          />
        ) : null}
        <LinkButton
          label={targetPath ? 'Update Path' : 'Set Target Path'}
          labelStyle={{ fontSize: 12 }}
          onPress={() => {
            requestPermission().then(() =>
              DirectoryPickerManager.showDirectoryPicker(
                null,
                async (response) => {
                  if (response.didCancel || response.error) {
                    return;
                  }

                  const { path: targetPath } = response;

                  onUpdate({
                    ...container,
                    targetPath,
                    syncedAt: 0,
                  });
                },
              ),
            );
          }}
        />
      </RGroup>
    </VGroup>
  );
};

const ContainerList = ({ mappings, onUpdate, onCopyAll, onSynchronize }) =>
  mappings.map((item, index) => (
    <ContainerListItem
      key={item.name}
      container={item}
      onUpdate={(newItem) => {
        onUpdate(replaceMapping(newItem, mappings, index));
      }}
      onCopyAll={onCopyAll}
      onSynchronize={onSynchronize}
    />
  ));

const ContainerListLoader = ({
  server,
  onUpdate,
  mappings: initialMappings = [],
  ...props
}) => {
  const [mappings, setMappings] = useState(initialMappings);

  useEffect(() => {
    (async () => {
      const list = await fetchContainers(server);

      setMappings(
        list.map((container) => {
          const { name } = container;
          const mapping = mappings.find((item) => name === item.name);

          return (
            mapping || {
              ...container,
              targetPath: '',
              syncedAt: 0,
            }
          );
        }),
      );
    })();
  }, [server]);

  return (
    <ContainerList
      mappings={mappings}
      {...props}
      onUpdate={(list) => {
        setMappings(list);
        onUpdate(list);
      }}
    />
  );
};

export default ContainerListLoader;
