import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import {
  TextButton,
  Header,
  Spacer,
  HGroup,
  SBGroup,
} from '@actualwave/react-native-kingnare-style';

import ContainerList from './ContainerList';

const ContainerMappings = ({ server, onMappingsUpdate, ...props }) => {
  return (
    <>
      <Header>File Target Mappings</Header>
      <ScrollView>
        <ContainerList server={server} onUpdate={onMappingsUpdate} {...props} />
        <Spacer style={{ height: 50 }} />
      </ScrollView>
    </>
  );
};

class AssetDownloader extends Component {
  state = {};

  async downloadAssets(containers, sync = true) {
    const { server, mappings, onMappingsUpdate } = this.props;
    const { length } = containers;

    try {
      await requestPermission();
    } catch (error) {
      // Imagine not being a dick
      return;
    }

    for (let index = 0; index < length; index++) {
      const container = containers[index];
      const { name, targetPath, syncedAt } = container;

      if (!targetPath) {
        continue;
      }

      this.setState({ [name]: { index: 0, length: 0 } });

      await downloadAssetsFromRoot(
        server,
        name,
        targetPath,
        sync ? syncedAt : 0,
        (file, assetIndex, length) => {
          this.setState({ [name]: { index: assetIndex, length } });
        },
        (file, assetIndex, error) => {},
      );

      onMappingsUpdate(
        replaceMapping(
          {
            ...container,
            syncedAt: Date.now(),
          },
          mappings,
        ),
      );

      this.setState({ [name]: undefined });
    }
  }

  handleCopyAll = (mappings) => this.downloadAssets(mappings, false);
  handleSynchronize = (mappings) => this.downloadAssets(mappings, true);
  handleCopyAllForAll = () => this.handleCopyAll(this.props.mappings);
  handleSynchronizeForAll = () => this.handleSynchronize(this.props.mappings);
  handleServerUpdate = () => {
    const { onServerUpdate, server } = this.props;

    onServerUpdate({ ...server });
  };

  render() {
    const inProgress =
      Object.keys(this.state).filter((key) => !!this.state[key]).length > 0;
    return (
      <>
        <ContainerMappings
          downloading={this.state}
          onCopyAll={this.handleCopyAll}
          onSynchronize={this.handleSynchronize}
          {...this.props}
        />
        <SBGroup>
          <TextButton label="Refresh" onPress={this.handleServerUpdate} />
          <HGroup noPadding>
            <TextButton
              label="Copy All"
              style={{ marginRight: 10 }}
              onPress={this.handleCopyAllForAll}
              disabled={inProgress}
            />
            <TextButton
              label="Synchronize"
              onPress={this.handleSynchronizeForAll}
              disabled={inProgress}
            />
          </HGroup>
        </SBGroup>
      </>
    );
  }
}

export default AssetDownloader;
