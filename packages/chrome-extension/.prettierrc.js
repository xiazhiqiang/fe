const { getPrettierConfig } = require('@iceworks/spec');

const config = getPrettierConfig('react');
config.pluginSearchDirs = false;

module.exports = config;
