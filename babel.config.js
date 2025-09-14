module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Arrancamos SIN plugins para aislar
    plugins: [],
  };
};
