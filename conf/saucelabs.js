// Sauce Labs config

module.exports = {
  browsers: {
    android_51: { base: 'SauceLabs', browserName: 'android', platform: 'Linux', version: '5.1' }
    android_44: { base: 'SauceLabs', browserName: 'android', platform: 'Linux', version: '4.4' }
    android_23: { base: 'SauceLabs', browserName: 'android', platform: 'Linux', version: '2.3' }
    chrome_46: { base: 'SauceLabs', browserName: 'chrome', version: '46' },
    chrome_36: { base: 'SauceLabs', browserName: 'chrome', version: '36' },
    chrome_26: { base: 'SauceLabs', browserName: 'chrome', version: '26' },
    firefox_42: { base: 'SauceLabs', browserName: 'firefox', version: '42' },
    firefox_32: { base: 'SauceLabs', browserName: 'firefox', version: '32' },
    firefox_22: { base: 'SauceLabs', browserName: 'firefox', version: '22' },
    firefox_12: { base: 'SauceLabs', browserName: 'firefox', version: '12' },
    ie_11: { base: 'SauceLabs', browserName: 'internet explorer', platform: 'Windows 7', version: '11' },
    ie_10: { base: 'SauceLabs', browserName: 'internet explorer', platform: 'Windows 7', version: '10' },
    ie_9: { base: 'SauceLabs', browserName: 'internet explorer', platform: 'Windows 7', version: '9' },
    ie_8: { base: 'SauceLabs', browserName: 'internet explorer', platform: 'Windows 7', version: '8' },
    ios_92: { base: 'SauceLabs', browserName: 'iphone', platform: 'OS X 10.10', version: '9.2' },
    ios_71: { base: 'SauceLabs', browserName: 'iphone', platform: 'OS X 10.9', version: '7.1' },
    opera_12: { base: 'SauceLabs', browserName: 'opera', version: '12' },
    opera_11: { base: 'SauceLabs', browserName: 'opera', version: '11' },
    safari_9: { base: 'SauceLabs', browserName: 'safari', platform: 'OS X 10.11', version: '9' },
    safari_8: { base: 'SauceLabs', browserName: 'safari', platform: 'OS X 10.10', version: '8' }
    safari_7: { base: 'SauceLabs', browserName: 'safari', platform: 'OS X 10.9', version: '7' }
    safari_6: { base: 'SauceLabs', browserName: 'safari', platform: 'OS X 10.8', version: '6' }
  }
};
