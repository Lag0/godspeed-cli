import * as os from 'node:os';
import * as path from 'node:path';

/** ~/.godspeed — primary config directory */
export const CONFIG_DIR: string = path.join(os.homedir(), '.godspeed');

/** ~/.godspeed/config.json — primary config file */
export const CONFIG_FILE: string = path.join(CONFIG_DIR, 'config.json');

/** ~/.godspeed-sdk/config.json — legacy config file (migrated on first auth) */
export const LEGACY_CONFIG_FILE: string = path.join(os.homedir(), '.godspeed-sdk', 'config.json');
