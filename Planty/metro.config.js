// metro.config.js (Expo)
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  const { assetExts, sourceExts } = config.resolver;

  return {
    ...config,
    transformer: {
      ...config.transformer,
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      ...config.resolver,
      // svg만 소스 확장자로 보내고, 나머지 기본 assetExts(.otf 포함)는 그대로 둔다
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
    },
  };
})();
