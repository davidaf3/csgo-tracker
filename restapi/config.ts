interface Config {
  /** Database file name */
  dbFile: string;
}

export let config: Config = {
  dbFile: 'stats.db',
};
