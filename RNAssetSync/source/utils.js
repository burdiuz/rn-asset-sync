import { PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-community/async-storage';

const SERVER_STORAGE_KEY = 'server-address';
const CONTAINERS_STORAGE_KEY = 'containers-fs-mappings';

export const getServerFromStorage = async () => {
  let server;

  try {
    server = JSON.parse(await AsyncStorage.getItem(SERVER_STORAGE_KEY));
  } catch (error) {
    // ignore
  }

  return server || { address: '', port: '' };
};

export const saveServerToStorage = async (server) => {
  await AsyncStorage.setItem(SERVER_STORAGE_KEY, JSON.stringify(server));

  return server;
};

export const getMappingsFromStorage = async () => {
  let mappings;

  try {
    mappings = JSON.parse(await AsyncStorage.getItem(CONTAINERS_STORAGE_KEY));
  } catch (error) {
    // ignore
  }

  return mappings || [];
};

export const saveMappingsToStorage = async (mappings) => {
  await AsyncStorage.setItem(CONTAINERS_STORAGE_KEY, JSON.stringify(mappings));

  return mappings;
};

const getServerUrl = ({ address, port }) => `http://${address}:${port}`;

export const fetchContainers = async (server) =>
  fetch(`${getServerUrl(server)}`).then((response) => response.json());

export const fetchContainerContents = async (
  server,
  container,
  updatedAfter = 0,
) => {
  const url = `${getServerUrl(
    server,
  )}/list?root=${container}&mtime=${updatedAfter}`;

  return fetch(url).then((response) => response.json());
};

const downloadAssetFile = async (server, fromUrl, toFile) => {
  const [, dirPath] = toFile.match(/(.+[/\\])[^/\\]+$/);
  const dirExists = await RNFS.exists(dirPath);

  if (!dirExists) {
    await RNFS.mkdir(dirPath);
  }

  const { promise } = RNFS.downloadFile({
    fromUrl: `${getServerUrl(server)}/read?file=${fromUrl}`,
    toFile,
  });

  return promise;
};

export const downloadAssetsFromRoot = async (
  server,
  container,
  targetPath,
  mtime = 0,
  progressCallback = () => null,
  errorCallback = () => null,
) => {
  let file;
  const files = await fetchContainerContents(
    server,
    container,
    (mtime / 1000) >> 0,
  );

  const { length } = files;

  for (let index = 0; index < length; index++) {
    try {
      file = files[index];

      progressCallback(file, index, length);

      const { path } = file;
      const [, filePath] = path.replace(/\\/g, '/').match(/^[^/]+(.+)$/);
      const toFile = `${targetPath}${filePath}`;

      await downloadAssetFile(server, path, toFile);
    } catch (error) {
      errorCallback(file, index, error);
    }
  }
};

export const requestPermission = () =>
  PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    {
      title: 'react-native Asset Sync Permission',
      message:
        "react-native Asset Sync App needs access to your file system to be able to save downloaded assets, otherwise it's existence is pointless.",
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'Fine',
    },
  ).then((response) => {
    if (response !== PermissionsAndroid.RESULTS.GRANTED) {
      return Promise.reject(response);
    }

    return response;
  });

export const replaceMapping = (
  item,
  list,
  index = list.find((listItem) => listItem.name === item.name),
) => {
  const newList = [...list];
  newList[index] = item;

  return newList;
};
