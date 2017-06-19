'use babel';

import os from 'os';

const platform = () => {
  const pf = os.platform();
  switch (pf) {
    case 'darwin':
      return 'mac';
    case 'win32':
      return 'win';
    default:
      return pf;
  }
};

const match = `${platform()}-${os.arch()}`;

export const fetchAssets = () => fetch('https://api.github.com/repos/avh4/elm-format/releases')
  .then(result => result.json())
  .then(json => json[0].assets.filter(asset => !asset.name.endsWith('.asc')))
  .then(assets => assets.map(asset => ({
    prefered: asset.name.includes(match),
    name: asset.name,
    url: asset.browser_download_url,
  })));
