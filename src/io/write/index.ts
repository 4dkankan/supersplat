/**
 * IO Write module - handles writing splat data to various destinations.
 */

// Browser file system
export { BrowserFileSystem } from './browser-file-system';
export { createDesktopFileStream, isDesktopFileBridgeAvailable } from './desktop-file-stream';

// Writer utilities
export {
    GZipWriter,
    ProgressWriter
} from './writer';
