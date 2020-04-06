import { normalizeColor } from 'grommet/utils';

const theme = {
  button: {
    border: {
      radius: '4px',
      width: '1px'
    },
    padding: {
      horizontal: '24px',
      vertical: '8px'
    },
    extend: props => `
      ${!props.primary &&
        `
         color: ${props.theme.global.colors.brand.light};
      `}
    `
  },
  calendar: {
    large: {
      daySize: '73.14px',
      fontSize: '20px',
      lineHeight: 1.11
    },
    medium: {
      daySize: '36.57px',
      fontSize: '12px',
      lineHeight: 1.45
    },
    small: {
      daySize: '18.29px',
      fontSize: '9.33px',
      lineHeight: 1.375
    }
  },
  chart: {},
  checkBox: {
    check: {
      radius: '4px'
    },
    size: '16px',
    toggle: {
      radius: '16px',
      size: '32px'
    }
  },
  clock: {
    analog: {
      hour: {
        size: '16px',
        width: '5px'
      },
      minute: {
        size: '8px',
        width: '3px'
      },
      second: {
        size: '6px',
        width: '2px'
      },
      size: {
        huge: '192px',
        large: '96px',
        medium: '64px',
        small: '48px',
        xlarge: '144px'
      }
    },
    digital: {
      text: {
        large: {
          height: 1.167,
          size: '14.66px'
        },
        medium: {
          height: 1.375,
          size: '12px'
        },
        small: {
          height: 1.43,
          size: '9.33px'
        },
        xlarge: {
          height: 1.1875,
          size: '17.33px'
        },
        xsmall: {
          height: 1.5,
          size: '6.66px'
        },
        xxlarge: {
          height: 1.125,
          size: '22.66px'
        }
      }
    }
  },
  date: '2020-03-20T17:19:10.000Z',
  defaultMode: 'light',
  diagram: {
    line: {}
  },
  email: 'd.mejia@alexslemonade.org',
  formField: {
    border: {
      color: 'active-background',
      error: {
        color: {
          dark: 'white',
          light: 'status-critical'
        }
      },
      position: 'inner',
      side: 'all',
      size: 'xsmall',
      style: 'solid'
    },
    content: {
      pad: 'medium'
    },
    disabled: {
      background: {
        color: 'status-disabled',
        opacity: 'medium'
      }
    },
    error: {
      color: 'status-critical',
      margin: {
        horizontal: 'small',
        vertical: 'xsmall'
      }
    },
    help: {
      color: 'brand',
      margin: {
        start: 'none'
      }
    },
    info: {
      color: 'text-xweak',
      margin: {
        horizontal: 'none',
        vertical: 'xsmall'
      }
    },
    label: {
      margin: {
        horizontal: 'none',
        vertical: 'xsmall'
      },
      size: 'small'
    },
    margin: {
      bottom: 'small'
    },
    round: '4px'
  },
  global: {
    active: {
      background: 'active-background',
      color: 'active-text'
    },
    borderSize: {
      large: '12px',
      medium: '8px',
      small: '3px',
      xlarge: '16px',
      xsmall: '1px'
    },
    breakpoints: {
      large: {},
      medium: {
        value: 1024
      },
      small: {
        borderSize: {
          large: '4px',
          medium: '3px',
          small: '2px',
          xlarge: '8px',
          xsmall: '1px'
        },
        edgeSize: {
          hair: '1px',
          large: '16px',
          medium: '8px',
          none: '0px',
          small: '4px',
          xlarge: '32px',
          xsmall: '2px',
          xxsmall: '2px'
        },
        size: {
          full: '100%',
          large: '256px',
          medium: '128px',
          small: '64px',
          xlarge: '512px',
          xsmall: '32px',
          xxsmall: '16px'
        },
        value: 512
      }
    },
    colors: {
      'active-background': 'background-contrast',
      'active-text': 'text-strong',
      'background-highlight': '#F2F2F2',
      background: {
        dark: '#111111',
        light: '#FFFFFF'
      },
      'background-back': {
        dark: '#111111',
        light: '#EEEEEE'
      },
      'background-contrast': {
        dark: '#FFFFFF',
        light: '#F2F2F2'
      },
      'background-front': {
        dark: '#222222',
        light: '#FFFFFF'
      },
      border: {
        dark: '#444444',
        light: '#CCCCCC'
      },
      brand: {
        dark: '#017FA3',
        light: '#017FA3'
      },
      control: 'brand',
      'graph-0': 'brand',
      'graph-1': 'status-warning',
      'selected-background': 'brand',
      'selected-text': 'text',
      'status-critical': '#FF4040',
      'status-disabled': '#CCCCCC',
      'status-ok': '#00C781',
      'status-unknown': '#CCCCCC',
      'status-warning': '#FFAA15',
      text: {
        dark: '#FDFDFD',
        light: '#000000'
      },
      'text-strong': {
        dark: '#FFFFFF',
        light: '#000000'
      },
      'text-weak': {
        dark: '#CCCCCC',
        light: '#999999'
      },
      'text-xweak': {
        dark: '#999999',
        light: '#666666'
      }
    },
    control: {
      border: {
        radius: '4px'
      }
    },
    drop: {
      border: {
        radius: '4px'
      }
    },
    edgeSize: {
      hair: '1px',
      large: '32px',
      medium: '16px',
      none: '0px',
      responsiveBreakpoint: 'small',
      small: '8px',
      xlarge: '64px',
      xsmall: '4px',
      xxsmall: '2px'
    },
    font: {
      family: 'Lato',
      height: '24px',
      maxWidth: '192px',
      size: '16px'
    },
    hover: {
      background: 'active-background',
      color: 'active-text'
    },
    input: {
      padding: '8px',
      weight: 600
    },
    selected: {
      background: 'selected-background',
      color: 'selected-text'
    },
    size: {
      full: '100%',
      large: '512px',
      medium: '256px',
      small: '128px',
      xlarge: '768px',
      xsmall: '64px',
      xxlarge: `${8 * 156}px`,
      xxsmall: '32px'
    },
    spacing: '16px'
  },
  heading: {
    font: {
      family: 'Arvo',
      weight: 'bold'
    },
    level: {
      '1': {
        large: {
          height: '59px',
          maxWidth: '875px',
          size: '55px'
        },
        medium: {
          height: '37px',
          maxWidth: '533px',
          size: '33px'
        },
        small: {
          height: '27px',
          maxWidth: '363px',
          size: '23px'
        },
        xlarge: {
          height: '80px',
          maxWidth: '1216px',
          size: '76px'
        }
      },
      '2': {
        large: {
          height: '40px',
          maxWidth: '576px',
          size: '36px'
        },
        medium: {
          height: '32px',
          maxWidth: '448px',
          size: '28px'
        },
        small: {
          height: '24px',
          maxWidth: '320px',
          size: '20px'
        },
        xlarge: {
          height: '48px',
          maxWidth: '704px',
          size: '44px'
        }
      },
      '3': {
        large: {
          height: '32px',
          maxWidth: '448px',
          size: '28px'
        },
        medium: {
          height: '27px',
          maxWidth: '363px',
          size: '23px'
        },
        small: {
          height: '21px',
          maxWidth: '277px',
          size: '17px'
        },
        xlarge: {
          height: '37px',
          maxWidth: '533px',
          size: '33px'
        }
      },
      '4': {
        large: {
          height: '24px',
          maxWidth: '320px',
          size: '20px'
        },
        medium: {
          height: '21px',
          maxWidth: '277px',
          size: '17px'
        },
        small: {
          height: '19px',
          maxWidth: '235px',
          size: '15px'
        },
        xlarge: {
          height: '27px',
          maxWidth: '363px',
          size: '23px'
        }
      },
      '5': {
        large: {
          height: '15px',
          maxWidth: '171px',
          size: '11px'
        },
        medium: {
          height: '15px',
          maxWidth: '171px',
          size: '11px'
        },
        small: {
          height: '15px',
          maxWidth: '171px',
          size: '11px'
        },
        xlarge: {
          height: '15px',
          maxWidth: '171px',
          size: '11px'
        }
      },
      '6': {
        large: {
          height: '13px',
          maxWidth: '149px',
          size: '9px'
        },
        medium: {
          height: '13px',
          maxWidth: '149px',
          size: '9px'
        },
        small: {
          height: '13px',
          maxWidth: '149px',
          size: '9px'
        },
        xlarge: {
          height: '13px',
          maxWidth: '149px',
          size: '9px'
        }
      }
    }
  },
  layer: {
    background: {
      dark: '#111111',
      light: '#FFFFFF'
    }
  },
  meter: {},
  name: 'resources-portal',
  paragraph: {
    large: {
      height: '19px',
      maxWidth: '235px',
      size: '15px'
    },
    medium: {
      height: '16px',
      maxWidth: '192px',
      size: '12px'
    },
    small: {
      height: '15px',
      maxWidth: '171px',
      size: '11px'
    },
    xlarge: {
      height: '21px',
      maxWidth: '277px',
      size: '17px'
    },
    xxlarge: {
      height: '27px',
      maxWidth: '363px',
      size: '23px'
    }
  },
  radioButton: {
    size: '16px'
  },
  rounding: 4,
  scale: 1,
  spacing: 16,
  text: {
    large: {
      height: '19px',
      maxWidth: '235px',
      size: '15px'
    },
    medium: {
      height: '24px',
      maxWidth: '192px',
      size: '16px'
    },
    small: {
      height: '15px',
      maxWidth: '171px',
      size: '11px'
    },
    xlarge: {
      height: '21px',
      maxWidth: '277px',
      size: '17px'
    },
    xsmall: {
      height: '13px',
      maxWidth: '149px',
      size: '9px'
    },
    xxlarge: {
      height: '27px',
      maxWidth: '363px',
      size: '23px'
    }
  }
};

export default theme;
