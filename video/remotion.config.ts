import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
// Môi trường cloud không tải được Chrome của Remotion -> dùng headless shell có sẵn.
// Trên máy của bạn, xoá dòng này (hoặc đặt REMOTION_BROWSER) để Remotion tự tải.
const browser =
  process.env.REMOTION_BROWSER ??
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (require('fs').existsSync(browser)) {
  Config.setBrowserExecutable(browser);
}
